# React Performance Optimization 실습
> 리액트 성능 최적화 기법을 실습하고 이해하기 위해 만든 프로젝트입니다.

## 소개
- **불필요한 리렌더링 감소**: `useMemo`, `useCallback`, `React.memo`
- **컴포넌트 구조 개선**: 코드 스플리팅, Suspense 활용
- **렌더링 성능 분석**: React DevTools, Profiler 사용

## 📂 포함된 내용
✅ React의 렌더링 방식 이해  
✅ 불필요한 렌더링 방지 (`React.memo`, `useCallback`, `useMemo`)  
✅ 가상화 기법 (`react-window`, `react-virtualized`)  
✅ 코드 스플리팅 및 동적 import  
✅ React Profiler와 DevTools 활용

### React.memo
- **React.memo란?** 
: RReact.memo는 컴포넌트의 불필요한 리렌더링을 방지하는 고차 컴포넌트(Higher-Order Component, HOC)다. 같은 props가 전달되면, 이전 렌더링 결과를 재사용 해서 성능을 최적화할 수 있다.

- **React.memo 적용 방법** 적용을 원하는 컴포넌트를 React.memo()로 감싸주면 된다.
- **React.memo Props 비교 방식 수정** : 어떤 기준으로 props가 변경되었는지 직접 판단할 수 있도록 두번째인수(비교 함수)를 사용한다.

```jsx
// user 객체 자체가 매번 새로 생성되어도, 비교 함수가 이전과 현재 user.name을 비교해서 동일하면 리렌더링을 막아준다!
const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.user.name === nextProps.user.name;
};

const Child = React.memo(({ user }) => {
  console.log("Child 렌더링됨!");
  return <div>안녕, {user.name}!</div>;
}, arePropsEqual);

// 즉, 
const arePropsEqual = (prevProps, nextProps) => {
  // props가 변경되지 않았으면 true 반환 → 렌더링 건너뛰기(= 리렌더링 안 함)
  // props가 변경되었으면 false 반환 → 렌더링 수행(= 리렌더링 함)
};
 
```
- **🚫React.memo**를 지양해야 하는 경우: 
1. 성능 저하를 일으킬 정도로 무겁지 않은 컴포넌트(예. 간단한 UI 요소 (<button>, <span> 등)) : 비교 연산 비용이 렌더링 비용보다 더 클 수 있다.
2. 자주 변경되는 props 를 받는 경우 : 리렌더링이 계속 발생해서 React.memo가 효과 없음
3. 객체, 배열, 함수 props를 전달하면서 useMemo / useCallback을 사용하지 않는 경우 : 참조값이 계속 바뀌어서 React.memo가 동작하지 않음
4. 상위 컴포넌트가 자주 리렌더링될 때 : 부모 리렌더링을 먼저 막아야 함
5. context 값을 직접 전달하는 경우 : context가  변경되면 React.memo가 무의미해짐

**📌즉, 실제 성능 최적화가 필요한 경우에만"적용해야 한다!** 
- 그러므로 profiler를 이용해서 성능상 이점이 있는지 확인 후 사용해야 한다!!