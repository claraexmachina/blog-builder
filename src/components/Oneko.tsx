'use client';

import { useEffect, useRef } from 'react';

export default function Oneko() {
  const nekoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nekoEl = nekoRef.current;
    if (!nekoEl) return;

    // 768px 미만에서 비활성화 (Dock과 동일 기준)
    if (window.innerWidth < 768) {
      nekoEl.style.display = 'none';
      return;
    }

    // 프로필 위젯 위치 기반 초기 위치 계산 (약간 지연 후 계산)
    const getInitialPosition = () => {
      const profileWidget = document.querySelector('.widget-box');
      if (profileWidget && window.innerWidth >= 768) {
        const rect = profileWidget.getBoundingClientRect();
        // 데스크톱: 프로필 위젯 내부 하단 근처
        return {
          x: rect.left + rect.width / 2,
          y: rect.bottom - 60,
        };
      }
      // 모바일/태블릿: 화면 왼쪽 하단
      return {
        x: 50,
        y: window.innerHeight - 150,
      };
    };

    // DOM이 완전히 렌더링된 후 위치 계산
    const initTimeout = setTimeout(() => {
      const pos = getInitialPosition();
      nekoPosX = pos.x;
      nekoPosY = pos.y;
      mousePosX = pos.x;
      mousePosY = pos.y;

      if (nekoEl) {
        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
      }
    }, 100);

    let nekoPosX = 100;
    let nekoPosY = 100;
    let mousePosX = 100;
    let mousePosY = 100;
    let frameCount = 0;
    let idleTime = 0;
    let idleAnimation: string | null = 'sleeping'; // 처음부터 자는 상태로 시작
    let idleAnimationFrame = 8; // tired 건너뛰고 바로 sleeping 시작
    let lastFrameTimestamp = 0;
    let animationFrameId: number;
    let forceSleep = true; // 처음 2초 동안 강제로 자는 상태 유지

    // 2초 후에 강제 수면 해제
    const forceSleepTimeout = setTimeout(() => {
      forceSleep = false;
    }, 2000);

    const nekoSpeed = 10; // 원본 속도
    const spriteSets: Record<string, number[][]> = {
      idle: [[-3, -3]],
      alert: [[-7, -3]],
      scratchSelf: [
        [-5, 0],
        [-6, 0],
        [-7, 0],
      ],
      scratchWallN: [
        [0, 0],
        [0, -1],
      ],
      scratchWallS: [
        [-7, -1],
        [-6, -2],
      ],
      scratchWallE: [
        [-2, -2],
        [-2, -3],
      ],
      scratchWallW: [
        [-4, 0],
        [-4, -1],
      ],
      tired: [[-3, -2]],
      sleeping: [
        [-2, 0],
        [-2, -1],
      ],
      N: [
        [-1, -2],
        [-1, -3],
      ],
      NE: [
        [0, -2],
        [0, -3],
      ],
      E: [
        [-3, 0],
        [-3, -1],
      ],
      SE: [
        [-5, -1],
        [-5, -2],
      ],
      S: [
        [-6, -3],
        [-7, -2],
      ],
      SW: [
        [-5, -3],
        [-6, -1],
      ],
      W: [
        [-4, -2],
        [-4, -3],
      ],
      NW: [
        [-1, 0],
        [-1, -1],
      ],
    };

    const setSprite = (name: string, frame: number) => {
      const sprite = spriteSets[name]?.[frame % spriteSets[name].length];
      if (!sprite || !nekoEl) return;
      nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
    };

    const resetIdleAnimation = () => {
      idleAnimation = null;
      idleAnimationFrame = 0;
    };

    const idle = () => {
      idleTime += 1;

      if (idleTime > 10 && Math.floor(Math.random() * 50) === 0 && idleAnimation === null) {
        const availableIdleAnimations = ['sleeping', 'scratchSelf'];
        idleAnimation = availableIdleAnimations[Math.floor(Math.random() * availableIdleAnimations.length)];
      }

      if (idleAnimation !== null) {
        switch (idleAnimation) {
          case 'sleeping':
            if (idleAnimationFrame < 8) {
              setSprite('tired', 0);
            } else {
              setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
            }
            if (idleAnimationFrame > 192) {
              resetIdleAnimation();
            }
            break;
          case 'scratchSelf':
            setSprite('scratchSelf', idleAnimationFrame);
            if (idleAnimationFrame > 9) {
              resetIdleAnimation();
            }
            break;
          default:
            setSprite('idle', 0);
        }
        idleAnimationFrame += 1;
      } else {
        setSprite('idle', 0);
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mousePosX = event.touches[0].clientX;
        mousePosY = event.touches[0].clientY;
      }
    };

    const frame = () => {
      frameCount += 1;

      // 강제 수면 상태일 때는 계속 자는 애니메이션
      if (forceSleep) {
        setSprite('sleeping', Math.floor(idleAnimationFrame / 4));
        idleAnimationFrame += 1;
        return;
      }

      const diffX = nekoPosX - mousePosX;
      const diffY = nekoPosY - mousePosY;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

      // 거리가 가까우면 idle 상태
      if (distance < nekoSpeed || distance < 48) {
        idle();
        return;
      }

      idleAnimation = null;
      idleAnimationFrame = 0;
      idleTime = 0;

      let direction = '';
      if (diffY / distance > 0.5) direction += 'N';
      if (diffY / distance < -0.5) direction += 'S';
      if (diffX / distance > 0.5) direction += 'W';
      if (diffX / distance < -0.5) direction += 'E';

      setSprite(direction, frameCount);

      nekoPosX -= (diffX / distance) * nekoSpeed;
      nekoPosY -= (diffY / distance) * nekoSpeed;

      nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
      nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

      if (nekoEl) {
        nekoEl.style.left = `${nekoPosX - 16}px`;
        nekoEl.style.top = `${nekoPosY - 16}px`;
      }
    };

    // 원본처럼 100ms 간격으로 프레임 실행
    const onAnimationFrame = (timestamp: number) => {
      if (timestamp - lastFrameTimestamp > 100) {
        lastFrameTimestamp = timestamp;
        frame();
      }
      animationFrameId = requestAnimationFrame(onAnimationFrame);
    };

    // 초기 sleeping 스프라이트 설정
    setSprite('sleeping', 0);

    // 이벤트 리스너 등록
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('touchmove', onTouchMove);

    // 리사이즈 시 위치 재조정
    const onResize = () => {
      nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
      nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);
    };
    window.addEventListener('resize', onResize);

    // 애니메이션 시작
    animationFrameId = requestAnimationFrame(onAnimationFrame);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(forceSleepTimeout);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={nekoRef}
      id="oneko"
      aria-hidden="true"
      style={{
        width: '32px',
        height: '32px',
        position: 'fixed',
        pointerEvents: 'none',
        imageRendering: 'pixelated',
        backgroundImage: 'url(/images/oneko.gif)',
        zIndex: 9999,
      }}
    />
  );
}
