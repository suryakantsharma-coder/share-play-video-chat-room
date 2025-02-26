import React, { useEffect } from "react";
import { useSocket } from "@/context/SocketProvider";
import ReactPlayer from "react-player";
import useWebRTC from "@/hooks/useWebRTC";
import { Socket } from "socket.io-client";
import Draggable from "react-draggable";

const RoomPage = () => {

  const socket : Socket | null = useSocket();
  const {
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
    handleNegoNeedFinal
  } = useWebRTC({socket});
  
  useEffect(() => {
    if (socket !== null) {
      socket.on("user:joined",handleUserJoined);
      socket.on("incomming:call",handleIncomingCall);
      socket.on("call:accepted", handleCallAccepted);
      socket.on("peer:nego:needed", handleNegoNeedIncoming);
      socket.on("peer:nego:final", handleNegoNeedFinal);
      socket.on("call:sendStream", (e) => {
        console.log({ e })
        sendStreams();
      });
      
    }
    return () => {
      if (socket !== null) {
        socket.off("user:joined", handleUserJoined);
        socket.off("incomming:call", handleIncomingCall);
        socket.off("call:accepted", handleCallAccepted);
        socket.off("peer:nego:needed", handleNegoNeedIncoming);
        socket.off("peer:nego:final", handleNegoNeedFinal);
      }
    };
  }, [
    socket,
    handleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    handleSubmitForm();
  }, [])


  return (
    <div className="w-screen h-screen bg-[#3C4043] overflow-hidden">
      {/* <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4> */}
      <div className="w-[100%] flex justify-center">
        {isIncomingCall && <button className="text-center text-[16px] bg-green-800 px-[18px] p-[10px] rounded-[6px] cursor-pointer" onClick={sendStreams}>Accept Call</button>}
      </div>
      <div className="w-[100%] flex justify-center">
        {!remoteStream && <button className="text-center text-[16px] bg-blue-800 px-[18px] p-[10px] rounded-[6px] cursor-pointer" onClick={handleCallUser}>Start Call</button>}
      </div>

      {/* <div className="w-screen grid grid-cols-[repeat(auto-fill,minmax(50%,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(40%,1fr))] p-[12px] gap-[12px]">
        {
          [myStream, remoteStream].map((stream : MediaStream | null, index : number) => {
            return (
              <div className=" h-[300]">
                <ReactPlayer
                  key={index}
                  style={{
                    borderRadius: 20,
                    border: "1px solid white",
                    overflow : "hidden",
                  }}
                  // muted={index > 0 ? false : true}
                  muted
                  playing
                  height="100%"
                  width="100%"
                  url={(stream !== null) ? stream : "https://www.youtube.com/watch?v=0PyHEaoZE1c"}
                />
              </div>
            ) 
          })
        }
      </div> */}

       {/* <div className="w-[100%] h-[100%] grid grid-cols-[repeat(auto-fill,minmax(50%,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(30%,1fr))] p-[12px] gap-[12px] overflow-hidden">

       {[myStream, remoteStream].map((stream: MediaStream | null, index: number) => {
        return (
          <div key={index} className="">
            {stream ? (
              <video
                ref={(video) => {
                  if (video && stream) {
                    video.srcObject = stream;
                    video.play();
                  }
                }}
                className="w-full h-full rounded-[20px] border border-white overflow-hidden object-cover"
                muted={ index > 0 ? false : true}
                autoPlay
                playsInline
              />
            ) : (
              <video
                className="w-full h-full rounded-[20px] border border-white overflow-hidden object-cover"
                controls
                autoPlay
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        );
      })}
      </div> */}

      {remoteStream  &&  <div className="w-[100%] h-[100%] flex justify-center mt-[10px]">

          <div className="w-[95%] h-[90%]">
            {myStream ? (
              <video
                ref={(video) => {
                  if (video && remoteStream) {
                    video.srcObject = remoteStream;
                    video.play();
                  }
                }}
                className="w-full h-[100%] rounded-[20px] border border-white overflow-hidden object-cover bg-[#3C4043]"
                muted={true}
                autoPlay
                playsInline
              />
            ) : (
              <video
                className="rounded-[20px] border border-white overflow-hidden object-cover bg-[#3C4043]"
                controls
                autoPlay
              >
                <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
        </div>
        
    
        {myStream && <div className="absolute w-[200px] h-[140px] bottom-[10px] right-[10px]">
           <video
                ref={(video) => {
                  if (video && myStream) {
                    video.srcObject = myStream;
                    video.play();
                  }
                }}
                className="w-full h-[100%] rounded-[10px] overflow-hidden object-cover"
                muted={true}
                autoPlay
                playsInline
              />
        </div>}
        
      </div>}

    </div>
  );
};

export default RoomPage;
