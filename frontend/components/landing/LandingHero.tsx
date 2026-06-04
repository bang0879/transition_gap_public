"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/shared/Button";
import { useResponsesStore } from "@/lib/store/responses";
import { useSessionStore } from "@/lib/store/session";
import { PreviewAside } from "./PreviewAside";
import { DiagnosisFlowModal } from "./DiagnosisFlowModal";

export function LandingHero() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [flowOpen, setFlowOpen] = useState(false);
  const initSession = useSessionStore((state) => state.initSession);
  const handleStart = () => {
    const trimmedCompanyName = companyName.trim();

    if (!trimmedCompanyName) return;

    useResponsesStore.getState().clear();
    useSessionStore.getState().clearSession();
    initSession(trimmedCompanyName);
    router.push("/diagnose/philosophy");
  };

  return (
    <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div>
        <div className="mb-[18px] inline-flex min-h-7 max-w-full items-center rounded-full border border-slate-200 bg-white px-[10px] py-1 text-[11px] font-[680] leading-[1.35] text-slate-500">
          인사제도 정합성 진단 · Transition Gap
        </div>
        <h2 className="m-0 max-w-[760px] text-[30px] font-[700] leading-[1.18] text-slate-900 sm:text-[42px]">
          좋다는 인사제도는 많은데,
          <br />
          왜 우리 조직은 구글이나 넷플릭스처럼
          <br />
          일하지 않을까요?
        </h2>
        <p className="mt-5 max-w-[620px] text-[14px] leading-[1.75] text-slate-600 sm:text-[15px] sm:leading-[1.8]">
          좋다는 선진 기업의 제도들을 조합한다고 해도 의도한 성과가 나오지는 않습니다.{" "}
          <strong className="font-[760] text-teal-deep">
            인사제도는 모범답안의 조합이 아니라, 하나의 경영 철학 아래 채용 · 평가 · 보상이
            엇박자 없이 정렬되는 구조입니다.
          </strong>{" "}
          본 진단은 회사가 지향하는 조직의 미래 방향과 현재 제도의 충돌 지점을 진단하고,
          그 간극을 실행 가능한 단계적 전환 로드맵으로 제시합니다.
        </p>
        <form
          className="mt-7 flex flex-col items-stretch gap-3 sm:mt-[34px] sm:flex-row sm:flex-wrap sm:items-center"
          onSubmit={(event) => {
            event.preventDefault();
            handleStart();
          }}
        >
          <input
            type="text"
            placeholder="회사명을 입력하세요"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="h-[38px] w-full rounded-[8px] border border-slate-200 bg-white px-4 text-[13px] text-slate-900 placeholder:text-slate-400 focus:border-teal focus:outline-none focus:ring-1 focus:ring-teal/20 sm:w-[220px]"
          />
          <Button type="submit" variant="primary" disabled={!companyName.trim()}>
            진단 시작
          </Button>
          <Button onClick={() => setFlowOpen(true)}>
            진단 흐름 보기
          </Button>
        </form>
      </div>
      <PreviewAside />
      <DiagnosisFlowModal open={flowOpen} onClose={() => setFlowOpen(false)} />
    </div>
  );
}
