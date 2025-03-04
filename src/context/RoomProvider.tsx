'use client';
import peer from '@/services/peers';
import {
  CallAcceptedParams,
  CallUserParams,
  IncomingCallParams,
  mediaControlsOptions,
  NegotiationFinalParams,
  NegotiationParams,
  roomProviderType,
} from '@/type/room';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useWebSocket } from './SocketProvider';

const RoomContext = createContext<roomProviderType | null>(null);

export const RoomProvider = ({ children }: { children: React.ReactNode }) => {
  const [roomId, setRoomId] = useState<string>('');

  // Webrtc Context

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [mediaControls, setMediaControls] = useState<mediaControlsOptions>({
    video: true,
    audio: true,
  });

  const [isShareScreen] = useState(false);

  const getMediaStream = useCallback(
    async (streamContorls: mediaControlsOptions, isScreenSharing: boolean) => {
      let stream = null;
      if (isScreenSharing) {
        stream = await navigator.mediaDevices.getDisplayMedia().catch((err) => {
          console.log({ err });
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia(streamContorls);
      }
      return stream;
    },
    [mediaControls],
  );

  const handleUserJoined = useCallback(({ email, id }: CallUserParams) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const createOffer = useCallback(
    async (socket: Socket) => {
      if (!remoteSocketId) return;
      const stream = await getMediaStream(mediaControls, isShareScreen);
      const offer = await peer.getOffer();
      if (socket !== null) socket.emit('user:call', { to: remoteSocketId, offer });
      if (stream) setMyStream(stream);
      else console.log('Stream not found');
    },
    [remoteSocketId],
  );

  const handleIncomingCall = useCallback(
    async ({ from, offer, email, socket }: IncomingCallParams) => {
      setRemoteSocketId(from);
      setIsIncomingCall(true);
      const stream = await getMediaStream(mediaControls, isShareScreen);
      if (stream) setMyStream(stream);
      else console.log('Stream not found');

      const ans = await peer.getAnswer(offer);
      if (socket !== null) socket.emit('call:accepted', { to: from, ans });
    },
    [],
  );

  const sendStreams = useCallback(() => {
    if (!myStream) return;
    myStream.getTracks().forEach((track) => peer?.peer.addTrack(track, myStream));
    setIsIncomingCall(false);
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ ans }: CallAcceptedParams) => {
      peer.setLocalDescription(ans);
      console.log('Call Accepted!');
      sendStreams();
    },
    [sendStreams],
  );

  const handleNegoNeeded = useCallback(
    async (socket: Socket) => {
      if (!remoteSocketId) return;
      const offer = await peer.getOffer();
      if (socket !== null) socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
    },
    [remoteSocketId],
  );

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(async ({ from, offer, socket }: NegotiationParams) => {
    const ans = await peer.getAnswer(offer);
    if (socket !== null) socket.emit('peer:nego:done', { to: from, ans });
  }, []);

  const handleNegoNeedFinal = useCallback(async ({ ans }: NegotiationFinalParams) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handleSubmitForm = useCallback((socket: Socket) => {
    console.log({ roomId });
    if (socket !== null) socket.emit('room:join', { email: roomId + '@gmail.com', room: 1 });
  }, []);

  useEffect(() => {
    peer.peer.addEventListener('track', (ev) => {
      const remoteStream = ev.streams[0];
      console.log('GOT TRACKS!!', { ev, remoteStream });
      setRemoteStream(remoteStream);
    });
  }, []);

  const disconnectCall = useCallback((socket: Socket) => {
    if (socket !== null) {
      peer.peer.close();
      // socket.disconnect();
    }
  }, []);

  const createDataChannel = useCallback(() => {
    const dataChannel: RTCDataChannel = peer.peer.createDataChannel('chat');
    setDataChannel(dataChannel);
  }, [peer]);

  useEffect(() => {
    if (dataChannel) {
      dataChannel.addEventListener('message', (e) => {
        console.log('message received', e);

        const { currentTime, timestamp } = JSON.parse(e.data);
        const networkDelay = (Date.now() - timestamp) / 1000; // Convert ms to seconds
        const estimatedTime = currentTime + networkDelay; // Adjust for delay

        if (videoRef.current) {
          const playerTime = videoRef?.current?.getCurrentTime();

          // If the difference is significant, seek to correct time
          if (Math.abs(playerTime - estimatedTime) > 0.3) {
            videoRef?.current?.seekTo(estimatedTime, 'seconds');
          }
        }
      });
    }
  }, [dataChannel]);

  useEffect(() => {
    if (peer) {
      peer.peer?.addEventListener('datachannel', (e) => {
        console.log('data channel is open');
        setDataChannel(e.channel);
      });
    }
  }, [peer]);

  const sendMessage = useCallback(
    (message: string) => {
      if (dataChannel) {
        if (dataChannel && dataChannel.readyState === 'open' && videoRef.current) {
          const currentTime = videoRef?.current?.getCurrentTime();
          const timestamp = Date.now(); // Timestamp for network delay calculation
          dataChannel.send(JSON.stringify({ currentTime, timestamp }));
          console.log('message sent :', message);
        }
      }
    },
    [dataChannel],
  );

  return (
    <RoomContext.Provider
      value={{
        roomId,
        setRoomId,
        handleUserJoined,
        createOffer,
        handleIncomingCall,
        handleCallAccepted,
        handleNegoNeedIncoming,
        handleNegoNeedFinal,
        disconnectCall,
        createDataChannel,
        sendMessage,
        handleSubmitForm,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
