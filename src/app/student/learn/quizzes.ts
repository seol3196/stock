// 퀴즈 데이터
export type QuestionType = 'ox' | 'choice' | 'text';

export interface Question {
    id: number;
    type: QuestionType;
    question: string;
    options?: string[];  // 4지선다용
    answer: string;
    acceptableAnswers?: string[];  // 주관식 유사 답변
    explanation: string;  // 오답 시 설명
}

export interface ChapterQuiz {
    chapterId: string;
    questions: Question[];
}

// 주관식 답변 체크 함수
export function checkTextAnswer(userInput: string, acceptableAnswers: string[]): boolean {
    const normalized = userInput.trim().replace(/\s/g, '').toLowerCase();
    return acceptableAnswers.some(answer =>
        normalized === answer.replace(/\s/g, '').toLowerCase()
    );
}

// 퀴즈 통과 여부 확인 (80% = 4/5 이상)
export function isQuizPassed(correctCount: number, totalCount: number): boolean {
    return (correctCount / totalCount) >= 0.8;
}

export const quizzes: ChapterQuiz[] = [
    // 1-1. 내 돈의 진짜 이름, '총 자산(순자산)'
    {
        chapterId: "1-1",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "총 자산은 지갑 속 현금만을 말한다.",
                answer: "X",
                explanation: "총 자산은 현금 + 예금 + 주식 평가액을 모두 합한 것이에요!"
            },
            {
                id: 2,
                type: 'ox',
                question: "현금이 적어도 예금과 주식이 많으면 총 자산은 클 수 있다.",
                answer: "O",
                explanation: "맞아요! 현금만 보면 안 되고, 예금과 주식까지 합쳐야 진짜 내 재산을 알 수 있어요."
            },
            {
                id: 3,
                type: 'choice',
                question: "총 자산을 계산할 때 포함되지 않는 것은?",
                options: ["현금", "예금", "주식", "친구의 돈"],
                answer: "4",
                explanation: "친구의 돈은 내 재산이 아니에요! 총 자산은 나만의 현금, 예금, 주식이에요."
            },
            {
                id: 4,
                type: 'choice',
                question: "현금 3,000원, 예금 2,000원, 주식 평가액 5,000원일 때 총 자산은?",
                options: ["3,000원", "5,000원", "7,000원", "10,000원"],
                answer: "4",
                explanation: "3,000 + 2,000 + 5,000 = 10,000원! 모두 더해야 해요."
            },
            {
                id: 5,
                type: 'choice',
                question: "'총 자산'이 알려주는 것은?",
                options: ["오늘 쓸 수 있는 돈", "내 재산의 진짜 규모", "이번 달 용돈", "은행 이자"],
                answer: "2",
                explanation: "총 자산은 '내가 가진 모든 것의 가치'를 알려주는 숫자예요!"
            }
        ]
    },
    // 1-2. 지갑(현금) vs 통장(예금)
    {
        chapterId: "1-2",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "현금은 지갑에 그냥 두면 시간이 지나도 늘어나지 않는다.",
                answer: "O",
                explanation: "맞아요! 현금은 그냥 두면 1,000원이 영원히 1,000원이에요. 이자가 안 붙어요."
            },
            {
                id: 2,
                type: 'ox',
                question: "예금은 바로 꺼내 쓸 수 있어서 편리하다.",
                answer: "X",
                explanation: "예금은 먼저 출금해야 쓸 수 있어요. 현금이 바로 쓸 수 있는 돈이에요!"
            },
            {
                id: 3,
                type: 'text',
                question: "돈을 통장에 넣는 것을 (       )이라고 한다.",
                answer: "입금",
                acceptableAnswers: ["입금", "입금하기", "저축", "저축하기", "예금", "예금하기"],
                explanation: "돈을 통장에 넣는 것은 '입금' 또는 '저축'이라고 해요!"
            },
            {
                id: 4,
                type: 'text',
                question: "돈을 통장에서 꺼내는 것을 (       )이라고 한다.",
                answer: "출금",
                acceptableAnswers: ["출금", "출금하기", "인출", "인출하기", "찾기"],
                explanation: "돈을 통장에서 꺼내는 것은 '출금' 또는 '인출'이라고 해요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "'금리'란 무엇인가요?",
                options: ["은행 건물 높이", "예금에 붙는 이자의 비율", "현금의 무게", "주식의 개수"],
                answer: "2",
                explanation: "금리는 '이자율'이에요. 금리가 높을수록 예금이 빨리 자라요!"
            }
        ]
    },
    // 1-3. 주식은 '평가액'이 중요해요
    {
        chapterId: "1-3",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "평가액은 매일 똑같이 유지된다.",
                answer: "X",
                explanation: "주가가 변하면 평가액도 변해요! 롤러코스터처럼 오르락내리락해요."
            },
            {
                id: 2,
                type: 'ox',
                question: "주가가 오르면 평가액도 올라간다.",
                answer: "O",
                explanation: "맞아요! 평가액 = 주가 × 보유수량이니까, 주가가 오르면 평가액도 올라요."
            },
            {
                id: 3,
                type: 'choice',
                question: "평가액을 계산하는 공식은?",
                options: ["주가 + 보유 수량", "주가 × 보유 수량", "주가 - 보유 수량", "주가 ÷ 보유 수량"],
                answer: "2",
                explanation: "평가액 = 주가 × 보유수량! 곱하기를 사용해요."
            },
            {
                id: 4,
                type: 'choice',
                question: "주가 2,000원인 주식을 3주 가지고 있을 때 평가액은?",
                options: ["2,000원", "3,000원", "5,000원", "6,000원"],
                answer: "4",
                explanation: "2,000원 × 3주 = 6,000원이에요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "'평가액'이 알려주는 것은?",
                options: ["내가 산 가격", "내 주식의 오늘 가치", "회사 직원 수", "내가 번 수익"],
                answer: "2",
                explanation: "평가액은 '오늘 기준으로 내 주식이 얼마인지' 알려줘요!"
            }
        ]
    },
    // 1-4. 주가가 싸면 좋은 회사일까요?
    {
        chapterId: "1-4",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "한 주 가격이 낮으면 그 회사는 무조건 싸다.",
                answer: "X",
                explanation: "피자 한 조각이 싸다고 피자 전체가 싼 게 아니에요! 시가총액을 봐야 해요."
            },
            {
                id: 2,
                type: 'ox',
                question: "시가총액은 회사를 통째로 사는 데 필요한 금액이다.",
                answer: "O",
                explanation: "맞아요! 시가총액 = 주가 × 전체 주식 수 = 회사 전체 가격이에요."
            },
            {
                id: 3,
                type: 'choice',
                question: "시가총액을 계산하는 공식은?",
                options: ["주가 + 전체 주식 수", "주가 × 전체 주식 수", "주가 - 전체 주식 수", "주가 ÷ 전체 주식 수"],
                answer: "2",
                explanation: "시가총액 = 주가 × 전체 주식 수! 곱하기예요."
            },
            {
                id: 4,
                type: 'choice',
                question: "주가 1,000원, 전체 주식 수 500주일 때 시가총액은?",
                options: ["500원", "1,000원", "1,500원", "500,000원"],
                answer: "4",
                explanation: "1,000원 × 500주 = 500,000원이에요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "주식이 진짜 싼지 비싼지 판단하려면 무엇과 비교해야 하나요?",
                options: ["한 주 가격", "회사 이름", "회사의 진짜 가치", "주식 색깔"],
                answer: "3",
                explanation: "붕어빵 가게 예시처럼, 같은 가격이라도 얼마나 돈을 잘 버는지가 중요해요!"
            }
        ]
    },
    // 2-1. 매수와 매도, 클릭 한 번의 약속
    {
        chapterId: "2-1",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "매수는 주식을 파는 것이다.",
                answer: "X",
                explanation: "매수는 '사는 것'이에요! 매도가 '파는 것'이에요."
            },
            {
                id: 2,
                type: 'ox',
                question: "매도 버튼을 누르면 현금이 늘어난다.",
                answer: "O",
                explanation: "맞아요! 매도하면 주식을 팔고 현금을 받으니까 현금이 늘어나요."
            },
            {
                id: 3,
                type: 'text',
                question: "주식을 사는 것을 (       )라고 한다.",
                answer: "매수",
                acceptableAnswers: ["매수", "매수하기", "사기", "구매", "구매하기"],
                explanation: "주식을 사는 것은 '매수'라고 해요! 영어로 Buy예요."
            },
            {
                id: 4,
                type: 'text',
                question: "주식을 파는 것을 (       )라고 한다.",
                answer: "매도",
                acceptableAnswers: ["매도", "매도하기", "팔기", "판매", "판매하기"],
                explanation: "주식을 파는 것은 '매도'라고 해요! 영어로 Sell이에요."
            },
            {
                id: 5,
                type: 'choice',
                question: "매수 버튼을 누르면 어떻게 되나요?",
                options: ["현금 ↑ 주식 ↓", "현금 ↓ 주식 ↑", "현금 ↑ 주식 ↑", "현금 ↓ 주식 ↓"],
                answer: "2",
                explanation: "매수하면 현금을 내고 주식을 받아요. 현금↓ 주식↑!"
            }
        ]
    },
    // 2-2. 왜 내 주식은 빨간색(▲)일까?
    {
        chapterId: "2-2",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "빨간색(▲)은 주가가 올라서 이익이라는 뜻이다.",
                answer: "O",
                explanation: "맞아요! 빨간색 ▲는 올라서 돈을 벌고 있다는 뜻이에요."
            },
            {
                id: 2,
                type: 'ox',
                question: "수익률 100%는 원금의 2배가 되었다는 뜻이다.",
                answer: "X",
                explanation: "수익률 100%는 '번 돈이 원금과 같다'는 뜻이에요. 2배가 되려면 원금+수익이니까 맞긴 하지만, 정확히는 '원금만큼 벌었다'가 맞아요."
            },
            {
                id: 3,
                type: 'choice',
                question: "수익을 계산하는 공식은?",
                options: ["평가액 + 산 가격", "평가액 × 산 가격", "평가액 - 산 가격", "평가액 ÷ 산 가격"],
                answer: "3",
                explanation: "수익 = 지금 가치(평가액) - 내가 산 가격! 빼기예요."
            },
            {
                id: 4,
                type: 'choice',
                question: "4,000원에 산 주식이 7,000원이 됐을 때 수익은?",
                options: ["3,000원", "4,000원", "7,000원", "11,000원"],
                answer: "1",
                explanation: "7,000원 - 4,000원 = 3,000원 수익이에요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "파란색(▼) 표시의 의미는?",
                options: ["이익", "손해", "변화 없음", "거래 완료"],
                answer: "2",
                explanation: "파란색 ▼는 주가가 내려서 손해라는 뜻이에요."
            }
        ]
    },
    // 사설 1-1. 모험가들의 지혜, 주식의 탄생
    {
        chapterId: "essay-1-1",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "400년 전 유럽에서 후추는 금처럼 귀했다.",
                answer: "O",
                explanation: "맞아요! 후추 한 줌이 금 한 줌과 같은 가치였대요."
            },
            {
                id: 2,
                type: 'ox',
                question: "주식은 한 사람이 모든 위험을 지기 위해 만들어졌다.",
                answer: "X",
                explanation: "반대예요! 주식은 '위험을 여러 사람이 나누기 위해' 만들어졌어요."
            },
            {
                id: 3,
                type: 'choice',
                question: "세계 최초의 주식회사는 어느 나라에서 만들어졌나요?",
                options: ["미국", "영국", "네덜란드", "프랑스"],
                answer: "3",
                explanation: "1602년 네덜란드에서 동인도 회사가 세계 최초 주식회사로 탄생했어요!"
            },
            {
                id: 4,
                type: 'choice',
                question: "주식이 탄생한 이유는?",
                options: ["돈을 숨기려고", "위험을 나누려고", "배를 예쁘게 꾸미려고", "후추를 더 맵게 만들려고"],
                answer: "2",
                explanation: "배가 침몰해도 전 재산을 잃지 않도록 여러 사람이 위험을 나눈 거예요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "100명이 1만 원씩 투자해 배가 침몰하면 한 사람이 잃는 돈은?",
                options: ["1,000원", "10,000원", "100,000원", "1,000,000원"],
                answer: "2",
                explanation: "각자 1만 원씩만 투자했으니, 최대 1만 원만 잃어요. 이게 주식의 장점!"
            }
        ]
    },
    // 사설 1-2. 종이 증서에서 스마트폰 화면까지
    {
        chapterId: "essay-1-2",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "옛날에는 주식을 사면 종이를 받았다.",
                answer: "O",
                explanation: "맞아요! 옛날에는 '주권'이라는 종이를 받았어요."
            },
            {
                id: 2,
                type: 'ox',
                question: "지금도 주식을 사려면 증권거래소에 직접 가야 한다.",
                answer: "X",
                explanation: "이제는 스마트폰이나 컴퓨터로 집에서 클릭 한 번으로 살 수 있어요!"
            },
            {
                id: 3,
                type: 'text',
                question: "옛날에 주식을 샀을 때 받던 종이를 (       )이라고 부른다.",
                answer: "주권",
                acceptableAnswers: ["주권", "주권증서", "증서", "주식증서"],
                explanation: "주권(株券)은 '회사의 주인임을 증명하는 종이'였어요!"
            },
            {
                id: 4,
                type: 'choice',
                question: "주식 형태의 변화 순서로 맞는 것은?",
                options: ["컴퓨터 → 종이 → 스마트폰", "종이 → 스마트폰 → 컴퓨터", "종이 → 컴퓨터 → 스마트폰", "스마트폰 → 종이 → 컴퓨터"],
                answer: "3",
                explanation: "종이(400년 전) → 컴퓨터 → 스마트폰(지금) 순서예요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "형태는 바뀌었지만 변하지 않은 주식의 의미는?",
                options: ["종이로 만들어진다", "회사의 주인임을 증명한다", "직접 가서 사야 한다", "금고에 보관해야 한다"],
                answer: "2",
                explanation: "종이든 데이터든, '회사의 주인'이라는 의미는 똑같아요!"
            }
        ]
    },
    // 사설 2-1. 숫자에 일희일비하지 않는 마음
    {
        chapterId: "essay-2-1",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "주가는 매일 오르락내리락 변한다.",
                answer: "O",
                explanation: "맞아요! 주가는 롤러코스터처럼 매일 변해요."
            },
            {
                id: 2,
                type: 'ox',
                question: "주가가 떨어지면 무조건 바로 팔아야 한다.",
                answer: "X",
                explanation: "무조건 팔면 안 돼요! 왜 떨어졌는지, 회사가 여전히 좋은지 먼저 확인해야 해요."
            },
            {
                id: 3,
                type: 'text',
                question: "현명한 투자자는 숫자보다 회사의 (       )를 본다.",
                answer: "가치",
                acceptableAnswers: ["가치", "진짜가치", "실제가치", "본질", "미래"],
                explanation: "화면 속 숫자보다 '회사의 진짜 가치'를 보는 게 중요해요!"
            },
            {
                id: 4,
                type: 'choice',
                question: "주가가 떨어졌을 때 확인해야 할 것은?",
                options: ["친구가 샀는지", "그래프가 예쁜지", "회사가 여전히 돈을 잘 버는지", "오늘 날씨가 좋은지"],
                answer: "3",
                explanation: "회사가 여전히 좋은 회사인지 확인하는 게 가장 중요해요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "좋은 회사의 주가가 일시적으로 떨어졌을 때 현명한 행동은?",
                options: ["당장 모두 팔기", "왜 떨어졌는지 확인하기", "화면 끄고 잊어버리기", "무조건 더 사기"],
                answer: "2",
                explanation: "일단 왜 떨어졌는지 이유를 확인하고 판단해야 해요!"
            }
        ]
    },
    // 사설 2-2. 투자와 투기를 가르는 한 끗
    {
        chapterId: "essay-2-2",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "투자는 회사를 공부하고 오래 기다리는 것이다.",
                answer: "O",
                explanation: "맞아요! 투자는 농사짓는 것처럼 꾸준히 키우는 거예요."
            },
            {
                id: 2,
                type: 'ox',
                question: "투기는 운에 맡기고 빨리 사고파는 것이다.",
                answer: "O",
                explanation: "맞아요! 투기는 복권 긁는 것처럼 운에 맡기는 거예요."
            },
            {
                id: 3,
                type: 'text',
                question: "주식을 사면 나는 그 회사의 (       )이 된다.",
                answer: "주주",
                acceptableAnswers: ["주주", "주인", "소유자", "오너"],
                explanation: "주식을 사면 그 회사의 '주주(주인)'가 돼요!"
            },
            {
                id: 4,
                type: 'choice',
                question: "다음 중 '투자'에 해당하는 것은?",
                options: ["소문 듣고 따라 사기", "그래프만 보고 찍기", "회사를 공부하고 오래 기다리기", "복권 긁는 기분으로 사기"],
                answer: "3",
                explanation: "투자는 회사를 공부하고 오래 기다리는 거예요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "진짜 주인(주주)이 알아야 할 것은?",
                options: ["친구들의 주식", "주가 그래프 색깔", "회사가 하는 일과 미래 계획", "증권사 건물 위치"],
                answer: "3",
                explanation: "진짜 주인이라면 우리 회사가 뭘 하고 앞으로 어떻게 될지 알아야죠!"
            }
        ]
    },
    // 사설 2-3. 시간이 주는 선물, 복리의 마법
    {
        chapterId: "essay-2-3",
        questions: [
            {
                id: 1,
                type: 'ox',
                question: "복리는 이자가 이자를 낳는 것이다.",
                answer: "O",
                explanation: "맞아요! 원금+이자에 또 이자가 붙어서 눈덩이처럼 커져요."
            },
            {
                id: 2,
                type: 'ox',
                question: "복리의 효과는 시간이 짧을수록 더 크다.",
                answer: "X",
                explanation: "반대예요! 시간이 길수록 복리의 마법이 더 강해져요."
            },
            {
                id: 3,
                type: 'choice',
                question: "10,000원을 10% 복리로 약 7년 두면 얼마가 되나요?",
                options: ["11,000원", "17,000원", "20,000원", "50,000원"],
                answer: "3",
                explanation: "10% 복리로 약 7년이면 2배가 돼요! 10,000원 → 약 20,000원"
            },
            {
                id: 4,
                type: 'choice',
                question: "복리의 마법을 가장 잘 활용하는 방법은?",
                options: ["빨리 사고 빨리 팔기", "일찍 시작하고 오래 기다리기", "한 번에 큰돈 넣기", "매일 사고팔기"],
                answer: "2",
                explanation: "일찍 시작할수록 복리의 마법이 더 오래 작동해요!"
            },
            {
                id: 5,
                type: 'choice',
                question: "'황금알을 낳는 거위' 이야기의 교훈은?",
                options: ["빨리 잡아먹어야 한다", "거위를 팔아야 한다", "참고 오래 키워야 한다", "거위를 숨겨야 한다"],
                answer: "3",
                explanation: "거위를 오래 키우면 황금알을 계속 받을 수 있어요. 복리도 마찬가지!"
            }
        ]
    }
];

// 특정 챕터의 퀴즈 가져오기
export function getQuizByChapterId(chapterId: string): ChapterQuiz | undefined {
    return quizzes.find(quiz => quiz.chapterId === chapterId);
}
