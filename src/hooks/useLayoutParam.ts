import { useSearchParams } from "react-router-dom";

export type CollectionLayout = "grid" | "list";

export function useLayoutParam() {
  const [searchParams, setSearchParams] = useSearchParams();
  const layout: CollectionLayout =
    searchParams.get("layout") === "list" ? "list" : "grid";

  const setLayout = (next: CollectionLayout) =>
    setSearchParams(
      (params) => {
        if (next === "grid") params.delete("layout");
        else params.set("layout", next);
        return params;
      },
      { replace: true },
    );

  return [layout, setLayout] as const;
}
