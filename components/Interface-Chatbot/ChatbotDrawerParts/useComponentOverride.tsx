"use client";
import * as React from "react";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import * as Babel from "@babel/standalone";
import type { ComponentOverrideNode } from "@/store/componentOverrides/componentOverridesSlice";

type OverrideRenderer = (props: any) => React.ReactNode;

/**
 * Walks the override tree along `path` and returns the `code` string at that
 * leaf, or null if no override is defined.
 *
 * Path semantics: ['sidebar'] -> tree.sidebar
 *                 ['sidebar','header'] -> tree.sidebar.subcomponents.header
 */
function selectOverrideCode(
  tree: Record<string, ComponentOverrideNode> | undefined,
  path: string[]
): string | null {
  if (!tree || path.length === 0) return null;
  let node: ComponentOverrideNode | undefined = tree[path[0]];
  for (let i = 1; i < path.length; i++) {
    node = node?.subcomponents?.[path[i]];
    if (!node) return null;
  }
  return node?.code || null;
}

/**
 * Compiles a JSX code string at runtime into a renderer function.
 *
 * The override `code` is expected to be the body of a render function, e.g.:
 *   `return (<div>Hello {props.name}</div>);`
 *
 * Available identifiers inside the code: React, props.
 */
function compileOverride(code: string): OverrideRenderer | null {
  try {
    const wrapped = `(function(React, props){ ${code} \n})`;
    const out = Babel.transform(wrapped, {
      presets: ["react"],
      filename: "override.tsx",
    }).code;
    if (!out) return null;
    // eslint-disable-next-line no-new-func
    const fn = (0, eval)(out) as (R: typeof React, p: any) => React.ReactNode;
    return (props: any) => fn(React, props);
  } catch (err) {
    // Surface compile errors in console so the editor user sees them.
    // eslint-disable-next-line no-console
    console.error("[componentOverride] compile failed", err);
    return null;
  }
}

/**
 * Returns a renderer function for the override at `path`, or null when none
 * is configured. Components should call this at the top of their render and
 * short-circuit to the override when present, otherwise fall back to their
 * default JSX.
 */
export function useComponentOverride(path: string[]): OverrideRenderer | null {
  const code = useSelector((state: any) =>
    selectOverrideCode(state?.componentOverrides?.tree, path)
  );

  return useMemo(() => {
    if (!code) return null;
    return compileOverride(code);
  }, [code]);
}
