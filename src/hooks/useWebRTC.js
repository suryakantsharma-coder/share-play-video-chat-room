import { useEffect, useCallback, useState, useRef } from 'react';
import peer from '@/services/peers';
import { useParams } from 'next/navigation';

// interface CallUserParams {
//   email: string;
//   id: string;
// }

// interface IncomingCallParams {
//   from: string;
//   offer: RTCSessionDescriptionInit;
//   email: string;
// }

// interface NegotiationParams {
//   from: string;
//   offer: RTCSessionDescriptionInit;
// }

// interface CallAcceptedParams {
//   from: string;
//   ans: RTCSessionDescriptionInit;
// }

// interface NegotiationFinalParams {
//   ans: RTCSessionDescriptionInit;
// }

// interface mediaControlsOptions {
//   video: boolean;
//   audio: boolean;
// }

const useWebRTC = ({ socket }) => {
  // const videoRef = useRef<HTMLVideoElement | null>(null);
  // const [dataChannel, setDataChannel] = useState<RTCDataChannel | null>(null);
  // const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  // const [myStream, setMyStream] = useState<MediaStream | null>(null);
  // const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  // const [isIncomingCall, setIsIncomingCall] = useState<boolean>(false);
  // const [mediaControls, setMediaControls] = useState<mediaControlsOptions>({
  //   video: true,
  //   audio: true,
  // });

  const videoRef = useRef(null);
  const [dataChannel, setDataChannel] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isIncomingCall, setIsIncomingCall] = useState(false);
  const [mediaControls, setMediaControls] = useState({
    video: true,
    audio: true,
  });

  const [isShareScreen] = useState(false);
  const { roomId } = useParams();

  const getMediaStream = useCallback(
    async (streamContorls, isScreenSharing) => {
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

  const handleUserJoined = useCallback(({ email, id }) => {
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
    async ({ from, offer, email }) => {
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
    myStream.getTracks().forEach((track) => peer?.peer.addTrack(track, myStream));
    setIsIncomingCall(false);
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ ans }) => {
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
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      if (socket !== null) socket.emit('peer:nego:done', { to: from, ans });
    },
    [socket],
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
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

  const createDataChannel = useCallback(() => {
    const dataChannel = peer.peer.createDataChannel('chat');
    setDataChannel(dataChannel);
    dataChannel.onmessage = (e) => {
      console.log('message received', e);
    };
    dataChannel.onopen = () => {
      console.log('data channel is open');
    };

    dataChannel.addEventListener('message', (e) => {
      console.log('message received', e);
    });
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
    (message) => {
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

  return {
    remoteSocketId,
    myStream,
    videoRef,
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
    createDataChannel,
    sendMessage,
  };
};

export default useWebRTC;
