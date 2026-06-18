import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ComponentOverrideNode {
  code?: string;
  subcomponents?: Record<string, ComponentOverrideNode>;
}

export interface ComponentOverridesState {
  tree: Record<string, ComponentOverrideNode>;
}

const initialState: ComponentOverridesState = {
  tree: {},
};

function ensurePath(
  tree: Record<string, ComponentOverrideNode>,
  path: string[]
): ComponentOverrideNode {
  if (path.length === 0) {
    throw new Error("path must not be empty");
  }
  let node: ComponentOverrideNode;
  if (!tree[path[0]]) {
    tree[path[0]] = {};
  }
  node = tree[path[0]];
  for (let i = 1; i < path.length; i++) {
    if (!node.subcomponents) node.subcomponents = {};
    if (!node.subcomponents[path[i]]) node.subcomponents[path[i]] = {};
    node = node.subcomponents[path[i]];
  }
  return node;
}

function deletePath(
  tree: Record<string, ComponentOverrideNode>,
  path: string[]
) {
  if (path.length === 0) return;
  if (path.length === 1) {
    delete tree[path[0]];
    return;
  }
  let node: ComponentOverrideNode | undefined = tree[path[0]];
  for (let i = 1; i < path.length - 1; i++) {
    node = node?.subcomponents?.[path[i]];
    if (!node) return;
  }
  if (node?.subcomponents) {
    delete node.subcomponents[path[path.length - 1]];
  }
}

const slice = createSlice({
  name: "componentOverrides",
  initialState,
  reducers: {
    setComponentOverride(
      state,
      action: PayloadAction<{ path: string[]; code: string }>
    ) {
      const { path, code } = action.payload;
      if (!Array.isArray(path) || path.length === 0) return;
      const node = ensurePath(state.tree, path);
      node.code = code;
    },
    clearComponentOverride(
      state,
      action: PayloadAction<{ path: string[] }>
    ) {
      const { path } = action.payload;
      if (!Array.isArray(path) || path.length === 0) return;
      deletePath(state.tree, path);
    },
    setComponentOverrideTree(
      state,
      action: PayloadAction<{ tree: Record<string, ComponentOverrideNode> }>
    ) {
      state.tree = action.payload.tree || {};
    },
    resetComponentOverrides(state) {
      state.tree = {};
    },
  },
});

export const {
  setComponentOverride,
  clearComponentOverride,
  setComponentOverrideTree,
  resetComponentOverrides,
} = slice.actions;

export default slice.reducer;
