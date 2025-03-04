import React, { useEffect } from 'react';
import { useWebSocket } from '@/context/SocketProvider';
import useWebRTC from '@/hooks/useWebRTC';
import CallControls from '@/components/call-controls';
import ReactPlayer from 'react-player';

const RoomPage = () => {
  const socket = useWebSocket();
  const {
    videoRef,
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
    disconnectCall,
    createDataChannel,
    sendMessage,
  } = useWebRTC({ socket });

  // useEffect(() => {
  //   if (socket !== null) {
  //     socket.on('user:joined', handleUserJoined);
  //     socket.on('incomming:call', handleIncomingCall);
  //     socket.on('call:accepted', handleCallAccepted);
  //     socket.on('peer:nego:needed', handleNegoNeedIncoming);
  //     socket.on('peer:nego:final', handleNegoNeedFinal);
  //     socket.on('call:sendStream', (e) => {
  //       console.log({ e });
  //       sendStreams();
  //     });
  //   }
  //   return () => {
  //     if (socket !== null) {
  //       socket.off('user:joined', handleUserJoined);
  //       socket.off('incomming:call', handleIncomingCall);
  //       socket.off('call:accepted', handleCallAccepted);
  //       socket.off('peer:nego:needed', handleNegoNeedIncoming);
  //       socket.off('peer:nego:final', handleNegoNeedFinal);
  //     }
  //   };
  // }, [
  //   socket,
  //   handleUserJoined,
  //   handleIncomingCall,
  //   handleCallAccepted,
  //   handleNegoNeedIncoming,
  //   handleNegoNeedFinal,
  // ]);

  useEffect(() => {
    handleSubmitForm();
  }, []);

  return (
    <div className="w-screen h-screen bg-[#202020] overflow-hidden">
      <div className="w-[100%] flex justify-center">
        {isIncomingCall && (
          <button
            className="text-center text-[16px] bg-green-800 px-[18px] p-[10px] rounded-[6px] cursor-pointer"
            onClick={sendStreams}
          >
            Accept Call
          </button>
        )}
      </div>

      <div className="w-[100%] h-[10%]">
        <button
          className="text-center text-[16px] bg-red-800 px-[18px] p-[10px] rounded-[6px] cursor-pointer"
          onClick={createDataChannel}
        >
          create data channel
        </button>
        <button
          className="text-center text-[16px] bg-red-800 px-[18px] p-[10px] rounded-[6px] cursor-pointer"
          onClick={() => {
            sendMessage('hello');
          }}
        >
          Send Message
        </button>
      </div>

      <div className="w-[100%] h-[80%]">
        <div className="w-[100%]  flex justify-center">
          {!remoteStream && (
            <button
              className="text-center text-[16px] bg-blue-800 px-[18px] p-[10px] rounded-[6px] cursor-pointer"
              onClick={handleCallUser}
            >
              Start Call
            </button>
          )}
        </div>

        {remoteStream && (
          <div className="w-[100%] h-[100%] flex justify-center mt-[10px]">
            <div className="w-[40%] h-[90%] grid grid-cols-2 gap-[20px]">
              {[myStream, remoteStream].map((stream, index) => (
                <div className="rounded-[20px] border border-[red] overflow-hidden">
                  <ReactPlayer
                    key={index}
                    width={'100%'}
                    height={'100%'}
                    style={{
                      backgroundColor: '#202020',
                    }}
                    muted={index === 0 || index === 2}
                    playing
                    url={stream}
                    className="w-full h-[100%] rounded-[20px]overflow-hidden object-cover bg-[#3C4043]"
                  />
                </div>
              ))}
              {/* {remoteStream && (
                <ReactPlayer
                width={'100%'}
                height={'100%'}
                style={{
                  backgroundColor: '#202020',
                  border: '2px solid blue',
                  }}
                  playing
                  url={remoteStream}
                  className="w-full h-[100%] rounded-[20px]overflow-hidden object-cover bg-[#3C4043]"
                  />
                  )} */}
            </div>
            <div className="w-[60%] h-[90%] rounded-[20px] border border-[red] overflow-hidden">
              <ReactPlayer
                ref={videoRef}
                width={'100%'}
                height={'100%'}
                style={{
                  backgroundColor: '#202020',
                }}
                playing
                controls
                url={'https://www.youtube.com/watch?v=B29ynpt7kIg'}
                className="w-full h-[100%] rounded-[20px]overflow-hidden object-cover bg-[#3C4043]"
              />
            </div>
          </div>
        )}
      </div>

      <div className="w-[100%] h-[10%] bg-[red]">
        <CallControls disconnect={disconnectCall} />
      </div>
    </div>
  );
};

export default RoomPage;
