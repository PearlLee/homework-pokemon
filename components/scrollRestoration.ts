import { useEffect } from "react";
import { useRouter } from "next/router";

export default function ScrollRestoration() {
    const router = useRouter();

    useEffect(() => {
        const restoreScroll = (url: string) => {
            const savedScroll = sessionStorage.getItem(`scroll:${url}`);

            if (savedScroll) {
                const y = parseInt(savedScroll);
                window.scrollTo(0, y);
            }
        };

        const saveScroll = () => {
            const url = router.asPath;
            sessionStorage.setItem(`scroll:${url}`, window.scrollY.toString());
        };

        window.addEventListener("beforeunload", saveScroll);
        router.events.on("routeChangeStart", saveScroll);
        router.events.on("routeChangeComplete", restoreScroll);

        return () => {
            window.removeEventListener("beforeunload", saveScroll);
            router.events.off("routeChangeStart", saveScroll);
            router.events.off("routeChangeComplete", restoreScroll);
        };
    }, [router]);

    return null;
}
