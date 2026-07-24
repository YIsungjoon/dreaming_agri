import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { question, farm_name, crop, growth_stage, system_prompt } = body;

		const nvidiaApiKey = env.NVIDIA_API_KEY;

		if (!nvidiaApiKey) {
			// Informative fallback response if NVIDIA_API_KEY is not pulled into local env yet
			return json({
				answer: `💡 <strong>${farm_name ?? '농장'} AI 분석 결과 (Vercel 연동 준비 모드)</strong>:<br/>
Vercel에 <code>NVIDIA_API_KEY</code> 환경변수가 성공적으로 추가되었습니다. 로컬에서 실시간 호출하려면 <code>cd frontend && npx vercel env pull .env.development.local</code>을 실행하세요.<br/><br/>
• <strong>대상 농가/작물</strong>: ${farm_name ?? '김제 농장'} (${crop ?? '토마토'} / ${growth_stage ?? '생식생장기'})<br/>
• <strong>권장 조치</strong>: 3화방 착과기 고습도 지속 시 5일 간격 방제제 살포 및 하부 잎 통풍 적엽 작업을 이행하십시오.`,
				source: 'fallback'
			});
		}

		const defaultSystemPrompt = system_prompt || `당신은 예측형 농장 운영관리 플랫폼 Dreaming Agri의 AI 수석 컨설턴트입니다.
현재 대상 농가: ${farm_name ?? '스마트농장'}, 작물: ${crop ?? '토마토'}, 생육단계: ${growth_stage ?? '생식생장기'}.
사용자의 질문과 농가 환경/작업 기록을 바탕으로 명확하고 실용적인 농업 생육 및 수확 지침을 답변하십시오.
반드시 추가 점검 가이드와 주의사항을 포함하고, 답변 끝에는 '⚠️ 본 AI 제안은 농업 전문가의 실제 현장 진단을 대체하지 않습니다.' 문구를 명시하십시오.`;

		const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${nvidiaApiKey}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				model: 'z-ai/glm-5.2',
				messages: [
					{ role: 'system', content: defaultSystemPrompt },
					{ role: 'user', content: question }
				],
				temperature: 1,
				top_p: 1,
				max_tokens: 4096,
				seed: 42,
				stream: false
			})
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
		const aiContent = data.choices?.[0]?.message?.content || '답변을 생성하지 못했습니다.';

		return json({
			answer: aiContent.replace(/\n/g, '<br/>'),
			model: 'z-ai/glm-5.2',
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
