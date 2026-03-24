"use client";

import { useCallback, useRef, useState } from "react";

export type ActiveField = "name" | "age";

export function useActiveField() {
  const [activeField, setActiveField] = useState<ActiveField>("name");
  const nameInputRef = useRef<HTMLInputElement>(null);
  const ageInputRef = useRef<HTMLInputElement>(null);

  const focusField = useCallback((field: ActiveField) => {
    const target = field === "name" ? nameInputRef.current : ageInputRef.current;
    target?.focus();
  }, []);

  const focusActive = useCallback(() => {
    focusField(activeField);
  }, [activeField, focusField]);

  const switchField = useCallback((field?: ActiveField) => {
    setActiveField((prev) => {
      const next = field ?? (prev === "name" ? "age" : "name");
      // Focus immediately from the same user interaction so mobile keyboard opens.
      focusField(next);
      return next;
    });
  }, [focusField]);

  return {
    activeField,
    setActiveField,
    switchField,
    focusField,
    focusActive,
    nameInputRef,
    ageInputRef,
  };
}
