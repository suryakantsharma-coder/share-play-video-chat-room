'use client';

import dynamic from 'next/dynamic';

const Lottie = dynamic(() => import('lottie-react'), { ssr: false });
import { useEffect, useState } from 'react';
import animationData from '@/assets/animations/1.json';
import animationData2 from '@/assets/animations/2.json';

interface animParams {
  anim: boolean;
  src: unknown;
}

function HomeAnimation() {
  const [anim, setAnim] = useState<animParams>({
    anim: true,
    src: animationData,
  });

  useEffect(() => {
    setTimeout(() => {
      const animationSrc: unknown = anim.anim ? animationData2 : animationData;
      setAnim({ anim: !anim.anim, src: animationSrc });
    }, 6000);
  }, [anim]);

  return (
    <div>
      <Lottie animationData={anim.src} />
    </div>
  );
}

export default HomeAnimation;
