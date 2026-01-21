import { NPCData, NPCState, Position, Season } from '@/game/types';

// NPC 데이터
export const NPC_DATA: Record<string, NPCData> = {
  pierre: {
    id: 'pierre',
    name: 'Pierre',
    nameKo: '피에르',
    defaultPosition: { x: 12, y: 4 },
    isShopkeeper: true,
    dialogues: {
      greeting: [
        '안녕하세요! 오늘도 좋은 하루 되세요!',
        '어서오세요! 필요한 게 있으신가요?',
        '오, 농부님! 오늘은 뭘 찾으시나요?',
      ],
      random: [
        '요즘 씨앗이 잘 팔리고 있어요.',
        '농사는 잘 되고 있나요?',
        '좋은 작물을 기르려면 매일 물을 주는 게 중요해요.',
        '오늘 날씨가 참 좋네요.',
        '열심히 일하는 모습이 보기 좋아요!',
      ],
      heartLevel: {
        2: ['농장이 점점 좋아지고 있네요!'],
        4: ['당신과 이야기하는 게 즐거워요.'],
        6: ['좋은 친구가 생긴 것 같아 기쁘네요.'],
        8: ['당신은 정말 대단한 농부예요!'],
        10: ['당신은 이 마을 최고의 농부예요!'],
      },
    },
    giftPreferences: {
      love: ['melon', 'pumpkin'],
      like: ['tomato', 'corn', 'potato'],
      dislike: ['fiber'],
      hate: [],
    },
    schedule: [
      { time: 6, position: { x: 12, y: 4 } },
      { time: 9, position: { x: 12, y: 4 } },
      { time: 18, position: { x: 12, y: 4 } },
      { time: 22, position: { x: 12, y: 4 } },
    ],
  },
  robin: {
    id: 'robin',
    name: 'Robin',
    nameKo: '로빈',
    defaultPosition: { x: 25, y: 8 },
    isShopkeeper: false,
    dialogues: {
      greeting: [
        '안녕! 농사는 어때?',
        '오늘도 열심히네!',
        '힘내! 넌 잘하고 있어.',
      ],
      random: [
        '나도 예전에 농사를 지어봤어.',
        '물을 충분히 주는 게 중요해.',
        '계절에 맞는 작물을 심어야 해.',
        '비 오는 날은 물을 안 줘도 돼.',
        '고품질 작물은 더 비싸게 팔려.',
      ],
      heartLevel: {
        2: ['네 농장이 점점 좋아지고 있어!'],
        4: ['너랑 얘기하는 게 좋아.'],
        6: ['우리 이제 친구야, 그치?'],
        8: ['넌 정말 대단해!'],
        10: ['넌 내 최고의 친구야!'],
      },
    },
    giftPreferences: {
      love: ['strawberry', 'cauliflower'],
      like: ['parsnip', 'potato'],
      dislike: ['stone'],
      hate: [],
    },
    schedule: [
      { time: 6, position: { x: 25, y: 8 } },
      { time: 10, position: { x: 20, y: 15 } },
      { time: 14, position: { x: 15, y: 12 } },
      { time: 18, position: { x: 25, y: 8 } },
    ],
  },
};

// 초기 NPC 상태 생성
export function createInitialNPCStates(): NPCState[] {
  return Object.values(NPC_DATA).map((npc) => ({
    id: npc.id,
    position: { ...npc.defaultPosition },
    direction: 'down',
    hearts: 0,
    talkedToday: false,
    giftedToday: false,
    giftsThisWeek: 0,
  }));
}

// NPC 데이터 가져오기
export function getNPCData(npcId: string): NPCData | undefined {
  return NPC_DATA[npcId];
}

// 랜덤 인사말 가져오기
export function getRandomGreeting(npcId: string): string {
  const npc = NPC_DATA[npcId];
  if (!npc) return '...';
  const greetings = npc.dialogues.greeting;
  return greetings[Math.floor(Math.random() * greetings.length)];
}

// 랜덤 대화 가져오기
export function getRandomDialogue(npcId: string, hearts: number): string {
  const npc = NPC_DATA[npcId];
  if (!npc) return '...';

  // 하트 레벨에 따른 특별 대화 확인
  const heartLevels = Object.keys(npc.dialogues.heartLevel)
    .map(Number)
    .filter((level) => hearts >= level * 100)
    .sort((a, b) => b - a);

  if (heartLevels.length > 0 && Math.random() < 0.3) {
    const topLevel = heartLevels[0];
    const heartDialogues = npc.dialogues.heartLevel[topLevel];
    if (heartDialogues && heartDialogues.length > 0) {
      return heartDialogues[Math.floor(Math.random() * heartDialogues.length)];
    }
  }

  // 일반 대화
  const dialogues = npc.dialogues.random;
  return dialogues[Math.floor(Math.random() * dialogues.length)];
}

// 선물 반응 가져오기
export function getGiftReaction(
  npcId: string,
  itemId: string
): { reaction: 'love' | 'like' | 'neutral' | 'dislike' | 'hate'; points: number; message: string } {
  const npc = NPC_DATA[npcId];
  if (!npc) {
    return { reaction: 'neutral', points: 20, message: '고마워요.' };
  }

  if (npc.giftPreferences.love.includes(itemId)) {
    return { reaction: 'love', points: 80, message: '와! 이거 정말 좋아해요! 고마워요!' };
  }
  if (npc.giftPreferences.like.includes(itemId)) {
    return { reaction: 'like', points: 45, message: '오, 좋은 선물이네요. 감사해요!' };
  }
  if (npc.giftPreferences.dislike.includes(itemId)) {
    return { reaction: 'dislike', points: -20, message: '음... 이건 별로예요.' };
  }
  if (npc.giftPreferences.hate.includes(itemId)) {
    return { reaction: 'hate', points: -40, message: '이건... 정말 싫어요.' };
  }

  return { reaction: 'neutral', points: 20, message: '고마워요.' };
}

// 현재 시간에 NPC 위치 가져오기
export function getNPCPositionAtTime(npcId: string, hour: number): Position {
  const npc = NPC_DATA[npcId];
  if (!npc) return { x: 0, y: 0 };

  // 시간에 맞는 스케줄 찾기
  let position = npc.defaultPosition;

  for (const entry of npc.schedule) {
    if (hour >= entry.time) {
      position = entry.position;
    }
  }

  return position;
}

// 하트 포인트를 하트 수로 변환 (0-10)
export function getHeartLevel(points: number): number {
  return Math.min(10, Math.floor(points / 100));
}

// 대화 보너스 포인트
export const TALK_BONUS = 20;

// 생일 선물 보너스 배율
export const BIRTHDAY_MULTIPLIER = 8;

// 주간 선물 제한
export const WEEKLY_GIFT_LIMIT = 2;
