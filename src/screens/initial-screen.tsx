'use client';
import { useAuth } from '@/context/GoogleAuthProvider';
import { GoogleLogin } from '@react-oauth/google';
import IPC from '@/components/inital-permission-component';
import HomeAnimation from '@/components/animations/home-animation';
import RoomIdMiniComponent from '@/components/room-id-modal';
import { useRoom } from '@/context/RoomProvider';
import { CallUserParams } from '@/type/room';
import { userInfo } from 'os';
import { useWebSocket } from '@/context/SocketProvider';

function InitialScreen() {
  const { isLogin, handleLoginSuccess, handleLoginFailure, userInfo } = useAuth();
  const { handleSubmitForm } = useRoom();
  const socket = useWebSocket();

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-[#FFFFFF] relative">
      <div className="w-[100%] h-[50%] flex justify-between items-center">
        {isLogin ? (
          <div className="w-[50%] px-[5%]">
            <h1 className="text-[30px] text-[#141414] font-bold text-center">Create Room</h1>

            <IPC />

            <div className="w-[100%] flex justify-center items-center mt-[20px]">
              <button
                className="w-[40%] px-[20px] h-[40px] mt-[10px] bg-blue-600 rounded-full text-[18px] text-center flex items-center justify-center cursor-pointer font-bold"
                onClick={() => {
                  try {
                    console.log('CREATE_USER');
                    if (socket) handleSubmitForm(socket);
                    else console.log('no socket');
                  } catch (err) {
                    console.log(err);
                  }
                }}
              >
                Create Room
              </button>
            </div>
          </div>
        ) : (
          <div className="w-[50%] px-[10%]">
            <h1 className="text-[40px] text-[#141414] font-bold -space-y-[20px]">
              Share YouTube videos
            </h1>
            <h1 className="text-[40px] text-[#141414] font-bold -mt-[20px]">
              with anyone, anytime.
            </h1>
            <p className="text-[18px] text-[#141414] mt-[10px]">
              Stay connected and collaborate with friends, family and colleagues, no matter where
              you are.
            </p>
            <div className="w-[100px] h-[40px] mt-[20px] bg-blue-600 rounded-[2px] text-[18px] text-center flex items-center justify-center cursor-pointer mt-[20px]">
              <GoogleLogin onSuccess={handleLoginSuccess} onError={handleLoginFailure} />
            </div>
          </div>
        )}
        <div className="w-[50%]">
          <HomeAnimation />
        </div>
      </div>
      <RoomIdMiniComponent />
    </div>
  );
}

export default InitialScreen;
