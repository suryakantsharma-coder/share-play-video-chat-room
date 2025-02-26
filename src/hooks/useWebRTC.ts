import { useEffect, useCallback, useState } from "react";
import peer from "@/services/peers";
import { Socket } from "socket.io-client";
import { useParams } from "next/navigation";

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

const useWebRTC = ({ socket } : {socket : Socket|null}) => {
    // const socket : Socket | null = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
    const [myStream, setMyStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
    const [isIncomingCall, setIsIncomingCall] = useState<boolean>(false);
    const { roomId } = useParams();

    const handleUserJoined = useCallback(({ email, id }: CallUserParams) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
    }, []);

    const handleCallUser = useCallback(async () => {
        if (!remoteSocketId) return;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const offer = await peer.getOffer();
        if (socket !== null) socket.emit("user:call", { to: remoteSocketId, offer });
        setMyStream(stream);
    }, [remoteSocketId, socket]);

    const handleIncomingCall = useCallback(async ({ from, offer, email }: IncomingCallParams) => {
        setRemoteSocketId(from);
        setIsIncomingCall(true);
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setMyStream(stream);
        console.log(`Incoming Call`, from, offer, email);
        const ans = await peer.getAnswer(offer);
        if (socket !== null) socket.emit("call:accepted", { to: from, ans });
    }, [socket]);

    const sendStreams = useCallback(() => {
        if (!myStream) return;
        myStream.getTracks().forEach((track) => peer.peer.addTrack(track, myStream));
        setIsIncomingCall(false);
    }, [myStream]);

    const handleCallAccepted = useCallback(({ ans }: CallAcceptedParams) => {
        peer.setLocalDescription(ans);
        console.log("Call Accepted!");
        sendStreams();
    }, [sendStreams]);

    const handleNegoNeeded = useCallback(async () => {
      if (!remoteSocketId) return;
      const offer = await peer.getOffer();
      if (socket !== null) socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
    }, [remoteSocketId, socket]);

    useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
    }, [handleNegoNeeded]);

    const handleNegoNeedIncoming = useCallback(async ({ from, offer }: NegotiationParams) => {
    const ans = await peer.getAnswer(offer);
    if (socket !== null) socket.emit("peer:nego:done", { to: from, ans });
    }, [socket]);

    const handleNegoNeedFinal = useCallback(async ({ ans }: NegotiationFinalParams) => {
        await peer.setLocalDescription(ans);
    }, []);
    
    const handleSubmitForm = useCallback(() => {
        // e.preventDefault();
        console.log({ roomId })
      if (socket !== null) socket.emit("room:join", { email : roomId + "@gmail.com" , room : 1 });
    },
    [socket]
    );

    useEffect(() => {
      peer.peer.addEventListener("track", (ev) => {
        const remoteStream = ev.streams[0];
        console.log("GOT TRACKS!!", { ev, remoteStream });
        setRemoteStream(remoteStream);
      });
    }, []);

    // useEffect(() => {
    //     console.log({socket})
    //     if (socket !== null) {
    //         socket.on("user:joined", handleUserJoined);
    //         socket.on("incoming:call", (e) => {
    //             console.log({incomingCall : e})
    //             handleIncomingCall(e)
    //         });
    //         socket.on("call:accepted", handleCallAccepted);
    //         socket.on("peer:nego:needed", handleNegoNeedIncoming);
    //         socket.on("peer:nego:final", handleNegoNeedFinal);
    //     }

    //     return () => {
    //         if (socket !== null) {
    //             socket.off("user:joined", handleUserJoined);
    //             socket.off("incoming:call", handleIncomingCall);
    //             socket.off("call:accepted", handleCallAccepted);
    //             socket.off("peer:nego:needed", handleNegoNeedIncoming);
    //             socket.off("peer:nego:final", handleNegoNeedFinal);
    //         }
    //     };
    // }, [socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal]);

    return {
      remoteSocketId,
      myStream,
        remoteStream,
      isIncomingCall,
      handleCallUser,
      sendStreams,
        handleSubmitForm,
      handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal
    };
};

export default useWebRTC;
