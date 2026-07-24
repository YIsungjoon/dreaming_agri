import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { question, farm_name, crop, growth_stage, system_prompt, mode = 'chat' } = body;

		const nvidiaApiKey = env.NVIDIA_API_KEY;

		// Select Model & Parameters based on task mode
		// General Chat uses lightweight Nemotron Nano; Agent workflows use GLM 5.2.
		const isAgentMode = mode === 'agent';
		const targetModel = isAgentMode ? 'z-ai/glm-5.2' : 'nvidia/nemotron-3.5-nano-30b-a3b';

		if (!nvidiaApiKey) {
			// Fallback response if NVIDIA_API_KEY is not pulled into local env yet
			return json({
				answer: `💡 <strong>${farm_name ?? '농장'} AI 분석 결과 (${targetModel})</strong>:<br/>
Vercel <code>NVIDIA_API_KEY</code>가 연결되어 있습니다. 로컬 실시간 API 호출 시 <code>npx vercel env pull .env.development.local</code>을 실행하세요.<br/><br/>
• <strong>사용 라우팅 모델</strong>: <code>${targetModel}</code> (${isAgentMode ? '에이전트 고성능 추론' : '일반 대화 효율형'})<br/>
• <strong>권장 조치</strong>: 3화방 착과기 고습도 지속 시 5일 간격 방제제 살포 및 통풍 적엽 작업을 권장합니다.`,
				source: 'fallback'
			});
		}

		const defaultSystemPrompt = system_prompt || `당신은 예측형 농장 운영관리 플랫폼 Dreaming Agri의 AI 수석 컨설턴트입니다.
현재 대상 농가: ${farm_name ?? '스마트농장'}, 작물: ${crop ?? '토마토'}, 생육단계: ${growth_stage ?? '생식생장기'}.
사용자의 질문과 농가 환경/작업 기록을 바탕으로 명확하고 실용적인 농업 생육 및 수확 지침을 답변하십시오.
반드시 추가 점검 가이드와 주의사항을 포함하고, 답변 끝에는 '⚠️ 본 AI 제안은 농업 전문가의 실제 현장 진단을 대체하지 않습니다.' 문구를 명시하십시오.`;

		// Build API Payload depending on mode
		const payload: Record<string, any> = {
			model: targetModel,
			messages: [
				{ role: 'system', content: defaultSystemPrompt },
				{ role: 'user', content: question }
			],
			temperature: 1,
			stream: false
		};

		if (isAgentMode) {
			// GLM 5.2 Agent Config
			payload.top_p = 1;
			payload.max_tokens = 16384;
			payload.seed = 42;
		} else {
			// Nemotron 3.5 Nano Config for General Chat
			payload.top_p = 0.95;
			payload.max_tokens = 16384;
			payload.reasoning_budget = 16384;
			payload.chat_template_kwargs = { enable_thinking: true };
		}

		const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${nvidiaApiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error('NVIDIA API Error:', response.status, errorText);
			return json({
				answer: `⚠️ <strong>NVIDIA API 호출 오류 (${response.status})</strong><br/>${errorText}`,
				error: true
			}, { status: response.status });
		}

		const data = await response.json();
		const choice = data.choices?.[0];
		let aiContent = choice?.message?.content || '답변을 생성하지 못했습니다.';

		// Extract reasoning content if returned by Nemotron thinking template
		if (choice?.message?.reasoning_content) {
			const reasoning = choice.message.reasoning_content;
			aiContent = `💭 <em>[생각 과정]: ${reasoning.slice(0, 300)}...</em><br/><br/>${aiContent}`;
		}

		return json({
			answer: aiContent.replace(/\n/g, '<br/>'),
			model: targetModel,
			mode,
			source: 'nvidia'
		});
	} catch (err: any) {
		console.error('Server endpoint error:', err);
		return json({
			answer: `⚠️ 서버 처리 중 오류가 발생했습니다: ${err?.message || err}`,
			error: true
		}, { status: 500 });
	}
};
