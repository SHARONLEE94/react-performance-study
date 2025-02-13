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