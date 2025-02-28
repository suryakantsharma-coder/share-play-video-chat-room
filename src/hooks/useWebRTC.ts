import { useEffect, useCallback, useState } from 'react';
import peer from '@/services/peers';
import { Socket } from 'socket.io-client';
import { useParams } from 'next/navigation';

interface CallUserParams {
  email: string;
  id: string;
}

interface IncomingCallParams {
  from: string;
  offer: RTCSessionDescriptionInit;
  email: string;
}

interface NegotiationParams {
  from: string;
  offer: RTCSessionDescriptionInit;
}

interface CallAcceptedParams {
  from: string;
  ans: RTCSessionDescriptionInit;
}

interface NegotiationFinalParams {
  ans: RTCSessionDescriptionInit;
}

interface mediaControlsOptions {
  video: boolean;
  audio: boolean;
}

const useWebRTC = ({ socket }: { socket: Socket | null }) => {
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isIncomingCall, setIsIncomingCall] = useState<boolean>(false);
  const [mediaControls, setMediaControls] = useState<mediaControlsOptions>({
    video: true,
    audio: true,
  });

  const [isShareScreen] = useState<boolean>(false);
  const { roomId } = useParams();

  const getMediaStream = useCallback(
    async (streamContorls: mediaControlsOptions, isScreenSharing: boolean) => {
      let stream: MediaStream | null | void = null;
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

  const handleCallUser = useCallback(async () => {
    if (!remoteSocketId) return;
    const stream = await getMediaStream(mediaControls, isShareScreen);
    const offer = await peer.getOffer();
    if (socket !== null) socket.emit('user:call', { to: remoteSocketId, offer });
    if (stream) {
      setMyStream(stream);
    }
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer, email }: IncomingCallParams) => {
      setRemoteSocketId(from);
      setIsIncomingCall(true);
      const stream = await getMediaStream(mediaControls, isShareScreen);
      if (stream) {
        setMyStream(stream);
      }
      console.log(`Incoming Call`, from, offer, email);
      const ans = await peer.getAnswer(offer);
      if (socket !== null) socket.emit('call:accepted', { to: from, ans });
    },
    [socket],
  );

  const sendStreams = useCallback(() => {
    if (!myStream) return;
    myStream.getTracks().forEach((track) => peer.peer.addTrack(track, myStream));
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

  const handleNegoNeeded = useCallback(async () => {
    if (!remoteSocketId) return;
    const offer = await peer.getOffer();
    if (socket !== null) socket.emit('peer:nego:needed', { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener('negotiationneeded', handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener('negotiationneeded', handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }: NegotiationParams) => {
      const ans = await peer.getAnswer(offer);
      if (socket !== null) socket.emit('peer:nego:done', { to: from, ans });
    },
    [socket],
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }: NegotiationFinalParams) => {
    await peer.setLocalDescription(ans);
  }, []);

  const handleSubmitForm = useCallback(() => {
    // e.preventDefault();
    console.log({ roomId });
    if (socket !== null) socket.emit('room:join', { email: roomId + '@gmail.com', room: 1 });
  }, [socket]);

  useEffect(() => {
    peer.peer.addEventListener('track', (ev) => {
      const remoteStream = ev.streams[0];
      console.log('GOT TRACKS!!', { ev, remoteStream });
      setRemoteStream(remoteStream);
    });
  }, []);

  const disconnectCall = useCallback(() => {
    if (socket !== null) {
      peer.peer.close();
      // socket.disconnect();
    }
  }, [socket]);

  return {
    remoteSocketId,
    myStream,
    remoteStream,
    isIncomingCall,
    handleCallUser,
    sendStreams,
    handleSubmitForm,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
    setMediaControls,
    disconnectCall,
  };
};

export default useWebRTC;
