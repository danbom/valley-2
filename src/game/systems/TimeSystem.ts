import { GameTime, Season, Weather } from '@/game/types';
import { getNextSeason, getRandomWeather } from '@/utils/helpers';

// 시간 상수
export const MINUTES_PER_GAME_HOUR = 60;
export const GAME_START_HOUR = 6;
export const GAME_END_HOUR = 26; // 새벽 2시
export const DAYS_PER_SEASON = 28;
export const REAL_SECONDS_PER_GAME_MINUTE = 7 / 10; // 실제 7초 = 게임 내 10분

// 초기 게임 시간
export function createInitialGameTime(): GameTime {
  return {
    hour: GAME_START_HOUR,
    minute: 0,
    day: 1,
    season: 'spring',
    year: 1,
    weather: 'sunny',
  };
}

// 시간 업데이트 (델타 타임은 초 단위)
export function updateTime(time: GameTime, deltaTime: number): GameTime {
  const newTime = { ...time };

  // 실제 시간을 게임 내 시간으로 변환
  const gameMinutesElapsed = deltaTime / REAL_SECONDS_PER_GAME_MINUTE;
  newTime.minute += gameMinutesElapsed;

  // 분 -> 시간 변환
  while (newTime.minute >= MINUTES_PER_GAME_HOUR) {
    newTime.minute -= MINUTES_PER_GAME_HOUR;
    newTime.hour += 1;
  }

  return newTime;
}

// 하루 넘기기 (수면 시)
export function advanceDay(time: GameTime): GameTime {
  const newTime = { ...time };

  newTime.day += 1;
  newTime.hour = GAME_START_HOUR;
  newTime.minute = 0;

  // 계절 변경
  if (newTime.day > DAYS_PER_SEASON) {
    newTime.day = 1;
    newTime.season = getNextSeason(newTime.season);

    // 연도 변경
    if (newTime.season === 'spring') {
      newTime.year += 1;
    }
  }

  // 날씨 결정
  newTime.weather = getRandomWeather(newTime.season);

  return newTime;
}

// 자정 지났는지 확인 (새벽 2시 이후)
export function isPastMidnight(time: GameTime): boolean {
  return time.hour >= GAME_END_HOUR;
}

// 상점 영업 시간인지 확인 (9시 - 17시)
export function isShopOpen(time: GameTime): boolean {
  return time.hour >= 9 && time.hour < 17;
}

// 현재 시간이 밤인지 확인
export function isNightTime(time: GameTime): boolean {
  return time.hour >= 20 || time.hour < 6;
}

// 늦은 시간인지 확인 (자정 이후, 피로 누적)
export function isLateNight(time: GameTime): boolean {
  return time.hour >= 24;
}

// 에너지 패널티 계산 (늦게 자면 에너지 회복 감소)
export function calculateSleepEnergyPenalty(time: GameTime): number {
  if (time.hour < 24) {
    return 1.0; // 100% 회복
  } else if (time.hour < 25) {
    return 0.75; // 75% 회복
  } else {
    return 0.5; // 50% 회복
  }
}

// 기절 체크 (새벽 2시 이후 또는 에너지 0)
export function shouldPassOut(time: GameTime, energy: number): boolean {
  return time.hour >= GAME_END_HOUR || energy <= 0;
}

// 시간 진행 일시정지 조건 (UI 열림, 대화 중 등)
export function shouldPauseTime(isPaused: boolean, isInMenu: boolean, isInDialogue: boolean): boolean {
  return isPaused || isInMenu || isInDialogue;
}

// 특정 시간까지 남은 게임 내 분
export function getMinutesUntil(current: GameTime, targetHour: number): number {
  const currentMinutes = current.hour * MINUTES_PER_GAME_HOUR + current.minute;
  const targetMinutes = targetHour * MINUTES_PER_GAME_HOUR;

  if (targetMinutes > currentMinutes) {
    return targetMinutes - currentMinutes;
  }
  // 다음 날
  return (24 * MINUTES_PER_GAME_HOUR - currentMinutes) + targetMinutes;
}

// 날씨 아이콘 이모지
export function getWeatherEmoji(weather: Weather): string {
  switch (weather) {
    case 'sunny':
      return '☀️';
    case 'rainy':
      return '🌧️';
    case 'stormy':
      return '⛈️';
    default:
      return '☀️';
  }
}

// 계절 아이콘 이모지
export function getSeasonEmoji(season: Season): string {
  switch (season) {
    case 'spring':
      return '🌸';
    case 'summer':
      return '🌻';
    case 'fall':
      return '🍂';
    case 'winter':
      return '❄️';
    default:
      return '🌸';
  }
}

// 오늘이 축제일인지 확인 (간단 구현)
export function isFestivalDay(time: GameTime): boolean {
  const festivals: Record<Season, number[]> = {
    spring: [13, 24],
    summer: [11, 28],
    fall: [16, 27],
    winter: [8, 25],
  };

  return festivals[time.season]?.includes(time.day) || false;
}

// 요일 번호 (1-7, 월-일)
export function getDayOfWeek(day: number): number {
  return ((day - 1) % 7) + 1;
}

// 주간 리셋 필요 여부 (매주 월요일)
export function isNewWeek(day: number): boolean {
  return getDayOfWeek(day) === 1;
}
