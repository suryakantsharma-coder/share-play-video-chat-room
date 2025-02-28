import {
  VideoCameraIcon,
  MicrophoneIcon,
  ComputerDesktopIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PhoneXMarkIcon,
} from '@heroicons/react/24/solid';

interface controlsProps {
  disconnect: () => void;
}

function CallControls({ disconnect }: controlsProps) {
  return (
    <div className="w-[100%] h-[100%] flex justify-center items-center bg-[#181818]">
      <div className=" flex justify-around gap-[20px] py-[20px]">
        <VideoCameraIcon
          className="w-[40px] h-[40px] p-[8px] rounded-full cursor-pointer bg-gray-500"
          style={{ backgroundColor: 'red' }}
        />
        <MicrophoneIcon
          className="w-[40px] h-[40px] p-[8px] rounded-full cursor-pointer bg-gray-500"
          style={{ backgroundColor: 'red' }}
        />
        <ComputerDesktopIcon
          className="w-[40px] h-[40px] p-[8px] rounded-full cursor-pointer bg-gray-500"
          style={{ backgroundColor: 'red' }}
        />
        <ChatBubbleOvalLeftEllipsisIcon
          className="w-[40px] h-[40px] p-[8px] rounded-full cursor-pointer bg-gray-500"
          style={{ backgroundColor: 'red' }}
        />
        <PhoneXMarkIcon
          className="w-[40px] h-[40px] p-[8px] rounded-full cursor-pointer bg-gray-500"
          style={{ backgroundColor: 'red' }}
          onClick={disconnect}
        />
      </div>
    </div>
  );
}

export default CallControls;
