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
: `RReact.memo`는 컴포넌트의 불필요한 리렌더링을 방지하는 고차 컴포넌트(`Higher-Order Component, HOC`)다. 같은 `props`가 전달되면, 이전 렌더링 결과를 재사용 해서 성능을 최적화할 수 있다.

- **React.memo 적용 방법** 적용을 원하는 컴포넌트를 `React.memo()`로 감싸주면 된다.
- **React.memo Props 비교 방식 수정** : 어떤 기준으로 `props`가 변경되었는지 직접 판단할 수 있도록 두번째인수(비교 함수)를 사용한다.

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
**🚫React.memo**를 지양해야 하는 경우: 
1. 성능 저하를 일으킬 정도로 무겁지 않은 컴포넌트(예. 간단한 UI 요소 (`<button>, <span>` 등)) : 비교 연산 비용이 렌더링 비용보다 더 클 수 있다.
2. 자주 변경되는 `props` 를 받는 경우 : 리렌더링이 계속 발생해서 `React.memo`가 효과 없음
3. 객체, 배열, 함수 `props`를 전달하면서 `useMemo / useCallback`을 사용하지 않는 경우 : 참조값이 계속 바뀌어서 `React.memo`가 동작하지 않음
4. 상위 컴포넌트가 자주 리렌더링될 때 : 부모 리렌더링을 먼저 막아야 함
5. `context` 값을 직접 전달하는 경우 : `context`가  변경되면 `React.memo`가 무의미해짐

**📌즉, 실제 성능 최적화가 필요한 경우에만"적용해야 한다!** 
👉 그러므로 profiler를 이용해서 성능상 이점이 있는지 확인 후 사용해야 한다!!

### 얕은 비교(Shallow Compare)
✔ 값 자체가 같은지(=== 연산자 사용)만 확인하고, 객체 내부까지는 확인하지 않는 방식
✔ 기본 자료형(`number, string, boolean`)은 문제가 없지만,
✔ 객체, 배열, 함수 같은 참조형 데이터는 === 비교 시 항상 "다른 값"으로 판단됨
✔ React에서 `React.memo`, `useEffect`, `useCallback`, `useMemo` 등에서 사용됨
✔ 객체를 props로 전달할 때는 useMemo나 useCallback으로 최적화해야 한다.

### 깊은 비교(Deep Compare)
✔ 단순히 메모리 주소가 같은지(===) 확인하는 얕은 비교(Shallow Compare)와 다르게, 객체 안의 값(모든 속성)들까지 확인한다.
✔ `JSON.stringify`를 사용하면 객체를 문자열로 변환한 후 비교하므로 내부 값이 같으면 `true`를 반환한다.

```js
const obj1 = { a: 1, b: 2 };
const obj2 = { a: 1, b: 2 };

// 얕은 비교
console.log(obj1 === obj2); // false (참조값이 다름)

// 깊은 비교
console.log(JSON.stringify(obj1) === JSON.stringify(obj2)); // true
```
🔴 하지만 순서가 다른 경우({ b: 2, a: 1 }) 비교가 실패할 수 있음

📌**깊은 비교 방법** 
1. Object depth가 깊지 않은 경우 : JSON.stringify()사용
2. Object depth가 깊은 경우 : lodash라이브러리의 isEqual() 사용

⚠️리엑트가 리렌더링 되는 경우
1. state 변경이 있을 때
2. 부모 컴포넌트가 렌더링 될 떄
3. shouldComponentUpdate에서 true가 반환될 때
4. forceUpdate가 실행될 때

### useCallback
`useCallback`은 함수를 메모이제이션(캐싱)하는 React Hook. 불필요한 함수 재생성을 방지해서 성능을 최적화하는 역할을 한다.
✔ useCallback을 사용하면, 특정 값이 변경되지 않는 한 함수가 새로 생성되지 않음
✔ 리렌더링이 되어도 기존 함수를 재사용 함

```jsx
const memoizedCallback = useCallback(() => {
  console.log("이 함수는 다시 생성되지 않음!");
}, []);
```
👉 `memoizedCallback`함수는 의존성 배열이 []이므로 최초 1회만 생성된다. 그러므로 이후 렌더링되어도 같은 함수가 재사용됨.

### useMemo
- 값(연산 결과)을 캐싱(메모이제이션-Memoization)하여 불필요한 계산을 방지하는 React Hook이다.
- 즉, 매번 계산하지 않고, 이전 결과를 재사용하는 방식으로 성능을 최적화할 수 있다.
```jsx
const memoizedValue = useMemo(() => 계산할 값, [의존성]);
```
- 계산할 값: 연산 결과를 반환하는 함수
- 의존성 배열([]): 배열의 값이 변경될 때만 연산을 다시 수행
✔ 의존성 값이 변하지 않으면 이전 결과를 그대로 사용
✔ 의존성 값이 변경되면 새로운 값을 계산해서 반환

- useMemo가 사용되는 경우
1. 연산 비용이 큰 경우
2. 객체/배열을 props로 전달할 때 React.memo와 함께 사용
3. 렌더링될 때 불필요한 재계산을 방지하고 싶을 때

### useMemo vs React.memo 차이점
✔ useMemo는 값(연산 결과, 객체, 배열 등)을 캐싱하여 불필요한 재계산 방지
✔ 연산 비용이 큰 경우, 객체/배열을 props로 전달할 때 최적화할 때 사용!