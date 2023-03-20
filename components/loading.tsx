import { pokemonListPage } from "@/core/state";
import { useEffect, useRef } from "react";
import { useRecoilCallback } from "recoil";

export default function Loading() {
    const nextPage = useRecoilCallback(({ set }) => () => {
        set(pokemonListPage, (oldValue) => oldValue + 1);
    });

    const ref = useRef(null);
    useEffect(() => {
        if (ref.current === null) return;
        let lastTrigger = 0;

        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    if (lastTrigger + 1000 <= Date.now()) {
                        lastTrigger = Date.now();
                        nextPage();
                    }
                }
            }
        });
        observer.observe(ref.current);
        return () => {
            observer.disconnect();
        };
    }, [nextPage]);

    return <p ref={ref}></p>;
}
