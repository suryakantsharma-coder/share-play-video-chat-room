'use client';
import useHardwareResources from '@/hooks/useHardwareResources';
import { VideoCameraIcon, MicrophoneIcon } from '@heroicons/react/24/solid';

function IPC() {
  const { videoRef, userPermission, handleUserPermissions } = useHardwareResources();

  return (
    <div className="w-full flex items-center justify-center bg-[white]">
      <div className="w-[100%] px-[5%] relative ">
        <video
          className="w-[100%] h-[350px] rounded-xl  relative shadow-xl object-cover bg-[black]"
          ref={videoRef}
          autoPlay
        />
        <div className="w-[100%] h-[40px] mt-[10px] flex items-center justify-center gap-[10px] bottom-0">
          <VideoCameraIcon
            className={`w-[80px] h-[40px] p-[8px] rounded-full cursor-pointer ${userPermission.video ? 'bg-blue-500' : 'bg-gray-500'}`}
            onClick={() => {
              handleUserPermissions(!userPermission.video, userPermission.audio);
            }}
          />
          <MicrophoneIcon
            className={`w-[80px] h-[40px] p-[8px] rounded-full cursor-pointer ${userPermission.audio ? 'bg-blue-500' : 'bg-gray-500'}`}
            onClick={() => {
              handleUserPermissions(userPermission.video, !userPermission.audio);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default IPC;
