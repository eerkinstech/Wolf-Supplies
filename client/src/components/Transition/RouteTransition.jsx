// import React from 'react';
// import transition from '../../assets/transition.png';

// const RouteTransition = ({ visible }) => {
//   if (!visible) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
//       <style>{`
//         @keyframes orbit { from { transform: rotate(0deg) translateX(70px) rotate(0deg); } to { transform: rotate(360deg) translateX(70px) rotate(-360deg); } }
//         @keyframes pop { 0% { transform: scale(0.7); opacity: 0 } 50% { transform: scale(1.02); opacity: 1 } 100% { transform: scale(1); opacity: 1 } }
//       `}</style>

//       <div className="relative flex items-center justify-center">
//         <div className="flex items-center justify-center w-40 h-40 rounded-full bg-white shadow-2xl">
//           <img src={transition} alt="Wolf Supplies LTD" className="w-32 h-auto object-contain animate-[pop_200ms_ease]" />
//         </div>

//         {/* <div style={{ position: 'absolute', width: 200, height: 200, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//           <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
//             <FaCircle className="text-2xl text-gray-400" style={{ animation: 'orbit 800ms linear infinite' }} />
//           </div>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// export default RouteTransition;
