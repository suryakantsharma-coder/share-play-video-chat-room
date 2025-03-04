'use client';
import IPC from '@/components/inital-permission-component';
import { useAuth } from '@/context/GoogleAuthProvider';
import { useRoom } from '@/context/RoomProvider';
import { GoogleLogin } from '@react-oauth/google';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

function JoinRoom() {
  const { isLogin, handleLoginSuccess, handleLoginFailure } = useAuth();
  const { roomId } = useParams();
  const { setRoomId } = useRoom();

  useEffect(() => {
    if (roomId) setRoomId((roomId as string) || '');
  }, [roomId]);

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-[#FFFFFF] relative">
      <div className="w-[60%] flex justify-between items-center">
        {isLogin ? (
          <div className="w-[100%] px-[10%]">
            <IPC />
          </div>
        ) : (
          <div className="w-[100%] px-[10%]">
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
      </div>
      {isLogin && (
        <div className="w-[50%] h-[50%] flex items-center justify-center">
          <div className="w-[100%]">
            <h1 className="text-[30px] text-[#141414] font-bold text-center">Join Room</h1>

            <p className="mt-[12px] text-[gray] text-center">Join now—your friends are waiting!</p>

            <div className="w-[100%] flex justify-center items-center mt-[20px]">
              <button className="w-[50%] px-[20px] h-[40px] mt-[10px] bg-blue-600 rounded-full text-[18px] text-center flex items-center justify-center cursor-pointer font-bold">
                Join
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JoinRoom;
