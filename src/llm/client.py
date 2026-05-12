"""
Gemini API wrapper.

모든 LLM 호출은 이 모듈을 통과한다.
"""

from __future__ import annotations

import os

import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite")


def _configure() -> None:
    """Gemini API key를 환경변수에서 읽어 설정한다."""
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        raise RuntimeError(
            "GEMINI_API_KEY가 .env에 정의되어 있지 않습니다. "
            ".env.example을 참고해 .env 파일을 생성하세요."
        )
    genai.configure(api_key=api_key)


def generate(
    prompt: str,
    *,
    model: str = DEFAULT_MODEL,
    system_instruction: str | None = None,
    temperature: float = 0.7,
) -> str:
    """Gemini 모델을 호출한다.

    Args:
        prompt: 사용자 프롬프트.
        model: 모델 ID.
        system_instruction: 시스템 프롬프트.
        temperature: 0.0~1.0 범위의 생성 온도.

    Returns:
        모델 응답 텍스트.
    """
    _configure()

    model_obj = genai.GenerativeModel(
        model_name=model,
        system_instruction=system_instruction,
    )

    response = model_obj.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=temperature,
        ),
    )

    return response.text


def health_check() -> bool:
    """API 연결 상태를 확인한다."""
    try:
        result = generate("Reply with exactly: OK", temperature=0.0)
        return "OK" in result
    except Exception as error:
        print(f"Health check failed: {error}")
        return False


if __name__ == "__main__":
    print("Gemini API health check...")
    print("OK" if health_check() else "FAILED")
