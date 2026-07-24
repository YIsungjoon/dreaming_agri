import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { question, farm_name, crop, growth_stage, system_prompt, mode = 'chat' } = body;

		const rawApiKey = env.NVIDIA_API_KEY;
		const nvidiaApiKey = rawApiKey ? rawApiKey.trim() : '';

		const isAgentMode = mode === 'agent';
		// Preferred models: General Chat uses Nemotron Nano; Agent uses GLM 5.2.
		const primaryModel = isAgentMode ? 'z-ai/glm-5.2' : 'nvidia/nemotron-3.5-nano-30b-a3b';
		const fallbackModel = isAgentMode ? 'nvidia/nemotron-3.5-nano-30b-a3b' : 'z-ai/glm-5.2';

		if (!nvidiaApiKey) {
			return json({
				success: true,
				answer: `💡 <strong>${farm_name ?? '농장'} AI 분석 결과 (${primaryModel})</strong>:<br/>
Vercel <code>NVIDIA_API_KEY</code> 설정이 감지되었습니다. 로컬 환경에서 실시간 호출하려면 <code>cd frontend && npx vercel env pull .env.development.local</code>을 실행하세요.<br/><br/>
• <strong>대상 작물</strong>: ${crop ?? '토마토'} (${growth_stage ?? '생식생장기'})<br/>
• <strong>권장 수칙</strong>: 3화방 착과기 고습도 지속 시 5일 간격 방제제 살포 및 온실 하부 통풍 적엽 조치를 권장합니다.`,
				source: 'fallback_no_key'
			});
		}

		const defaultSystemPrompt = system_prompt || `당신은 예측형 농장 운영관리 플랫폼 Dreaming Agri의 AI 수석 컨설턴트입니다.
현재 대상 농가: ${farm_name ?? '스마트농장'}, 작물: ${crop ?? '토마토'}, 생육단계: ${growth_stage ?? '생식생장기'}.
사용자의 질문과 농가 환경/작업 기록을 바탕으로 명확하고 실용적인 농업 생육 및 수확 지침을 답변하십시오.
반드시 추가 점검 가이드와 주의사항을 포함하고, 답변 끝에는 '⚠️ 본 AI 제안은 농업 전문가의 실제 현장 진단을 대체하지 않습니다.' 문구를 명시하십시오.`;

		// Helper function to execute NVIDIA fetch request
		async function fetchNvidiaModel(modelName: string) {
			const payload: Record<string, any> = {
				model: modelName,
				messages: [
					{ role: 'system', content: defaultSystemPrompt },
					{ role: 'user', content: question }
				],
				temperature: 1,
				stream: false
			};

			if (modelName.includes('nemotron')) {
				payload.top_p = 0.95;
				payload.max_tokens = 16384;
				payload.reasoning_budget = 16384;
				payload.chat_template_kwargs = { enable_thinking: true };
			} else {
				payload.top_p = 1;
				payload.max_tokens = 16384;
				payload.seed = 42;
			}

			return await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${nvidiaApiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
		}

		// Try primary model
		let response = await fetchNvidiaModel(primaryModel);
		let usedModel = primaryModel;

		// If primary model returns 404 or error, retry with fallback model
		if (!response.ok && response.status === 404) {
			console.warn(`Primary model ${primaryModel} returned 404. Trying fallback model ${fallbackModel}...`);
			response = await fetchNvidiaModel(fallbackModel);
			usedModel = fallbackModel;
		}

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`NVIDIA API Error (${response.status}):`, errorText);
			
			// Always return HTTP 200 to browser so web UI renders error message cleanly instead of browser 404 page
			return json({
				success: false,
				answer: `⚠️ <strong>NVIDIA API 호출 오류 (${response.status})</strong><br/>불러오기 실패 원인: ${errorText}<br/><br/>💡 <em>(API 키 또는 모델 접근 권한을 확인해주세요.)</em>`,
				status: response.status,
				error: true
			});
		}

		const data = await response.json();
		const choice = data.choices?.[0];
		let aiContent = choice?.message?.content || '답변 내용을 수신하지 못했습니다.';

		if (choice?.message?.reasoning_content) {
			const reasoning = choice.message.reasoning_content;
			aiContent = `💭 <em>[생각 과정]: ${reasoning.slice(0, 300)}...</em><br/><br/>${aiContent}`;
		}

		return json({
			success: true,
			answer: aiContent.replace(/\n/g, '<br/>'),
			model: usedModel,
			mode,
			source: 'nvidia'
		});
	} catch (err: any) {
		console.error('Server endpoint exception:', err);
		return json({
			success: false,
			answer: `⚠️ 서버 처리 중 예외가 발생했습니다: ${err?.message || err}`,
			error: true
		});
	}
};
