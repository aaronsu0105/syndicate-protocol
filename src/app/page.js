"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ThirdwebProvider, 
  ConnectWallet, 
  Web3Button, 
  useAddress, 
  useContract, 
  useContractRead 
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useTime } from "framer-motion";
import { 
  Building2, Activity, Boxes, Search, 
  Network, Cpu, Lock, ExternalLink, Sparkles, BarChart3, LineChart, ArrowUpRight, CheckCircle2, AlertTriangle,
  Globe, Info, Filter, ChevronDown
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS; 
const MANAGER_ADDRESS = process.env.NEXT_PUBLIC_MANAGER_ADDRESS;

// ==========================================
// 0. BRANDING & UI COMPONENTS
// ==========================================
function FractalLogo({ className }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
      <svg viewBox="0 0 100 100" className="w-full h-full relative z-10 overflow-visible">
        <motion.ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="rgba(96, 165, 250, 0.8)" strokeWidth="2.5" 
          animate={{ rotateZ: 360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />
        <motion.ellipse cx="50" cy="50" rx="16" ry="42" fill="none" stroke="rgba(129, 140, 248, 0.8)" strokeWidth="2.5" 
          animate={{ rotateZ: -360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: "center" }} />
        <circle cx="50" cy="50" r="7" className="fill-white drop-shadow-[0_0_12px_rgba(255,255,255,1)]" />
      </svg>
    </div>
  );
}

// NEW: Professional Tooltip for Financial Jargon
function Tooltip({ children, content }) {
  return (
    <div className="relative group inline-flex items-center justify-center cursor-help">
      {children}
      <div className="absolute bottom-full mb-3 hidden group-hover:block w-56 p-3 bg-[#0a0b12]/95 backdrop-blur-xl border border-white/20 rounded-xl text-[10px] text-slate-300 font-medium normal-case tracking-widest shadow-2xl z-50 text-center leading-relaxed">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white/20"></div>
      </div>
    </div>
  );
}

// NEW: Institutional Financial Marquee
function NetworkTicker() {
  return (
    <div className="fixed top-0 left-0 w-full bg-[#02040a] border-b border-blue-500/20 overflow-hidden z-[110] h-8 flex items-center">
      <motion.div 
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-16 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 w-max"
      >
        {/* We repeat the content twice to create an infinite seamless scrolling loop */}
        {[...Array(2)].map((_, i) => (
          <React.Fragment key={i}>
            <span className="flex items-center gap-2"><Globe className="w-3 h-3" /> NETWORK: SEPOLIA TESTNET</span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-emerald-500" /> RPC: ONLINE (42ms)</span>
            <span className="text-slate-600">|</span>
            <span>ETH/USD: $2,015.42 <span className="text-emerald-500">+1.24%</span></span>
            <span className="text-slate-600">|</span>
            <span>GLOBAL TVL: 14,291.50 ETH</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-500">GAS: 12 GWEI</span>
            <span className="text-slate-600">|</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

// ==========================================
// 1. SMART CONTRACT ABIs 
// ==========================================
const FACTORY_ABI = [
  { "inputs": [{ "type": "string", "name": "_assetName" }, { "type": "uint256", "name": "_fundingGoal" }], "name": "createPool", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "getAllPools", "outputs": [{ "type": "address[]" }], "stateMutability": "view", "type": "function" }
];

const POOL_ABI = [
  { "inputs": [], "name": "invest", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "assetName", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "fundingGoal", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalFunded", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "isClosed", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{"internalType": "address", "name": "", "type": "address"}], "name": "investorDeposits", "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "liquidatePosition", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

// ==========================================
// 2. VOLUMETRIC ASSET LIBRARY
// ==========================================
const CRYPTO_ASSETS = [
  { id: "BTC", bg: "from-[#fcd535] to-[#f7931a]", inner: "from-[#f7931a] to-[#d67b12]", border: "border-yellow-500", rim: "#92400e", viewBox: "0 0 32 32", svg: <g transform="rotate(14 16 16)"><path d="M21.536,15.706c1.196-0.849,1.96-2.128,1.96-3.666c0-2.883-2.361-5.234-5.275-5.234h-2.096V3h-2.228v3.805h-1.63V3H10.04v3.805H7v2.228h1.826c0.669,0,1.211,0.542,1.211,1.211v11.455c0,0.669-0.542,1.211-1.211,1.211H7v2.228h3.04V29h2.228v-3.805h1.63V29h2.228v-3.805h2.893c3.087,0,5.656-2.551,5.656-5.688C24.675,17.842,23.364,16.257,21.536,15.706z M14.364,9.034h3.606c1.657,0,3.006,1.348,3.006,3.006c0,1.658-1.349,3.006-3.006,3.006h-3.606V9.034z M18.423,22.972h-4.059v-5.918h4.059c1.916,0,3.475,1.558,3.475,3.475S20.339,22.972,18.423,22.972z" fill="white"/></g> },
  { id: "ETH", bg: "from-[#a855f7] to-[#6366f1]", inner: "from-[#8b5cf6] to-[#4f46e5]", border: "border-purple-400", rim: "#3730a3", viewBox: "0 0 24 24", svg: <path d="M11.963 17.977L4.582 13.617L11.963 24L19.344 13.617L11.963 17.977zM12.075 0L4.692 12.223L12.075 16.577L19.458 12.223L12.075 0z" fill="white"/> },
  { id: "SOL", bg: "from-[#14f195] to-[#9945ff]", inner: "from-[#10b981] to-[#7c3aed]", border: "border-emerald-400", rim: "#065f46", viewBox: "0 0 100 100", svg: <g fill="white"><polygon points="28,24 92,24 72,40 8,40" /><polygon points="8,46 72,46 92,62 28,62" /><polygon points="28,68 92,68 72,84 8,84" /></g> },
  { id: "USDC", bg: "from-[#2775ca] to-[#1a5ba8]", inner: "from-[#2775ca] to-[#1a5ba8]", border: "border-blue-400", rim: "#1e3a8a", viewBox: "0 0 100 100", svg: <g fill="none" stroke="white" strokeLinecap="round"><path d="M 23 20 A 35 35 0 0 0 23 80" strokeWidth="10" /><path d="M 77 20 A 35 35 0 0 1 77 80" strokeWidth="10" /><path d="M 62 38 C 62 24, 38 24, 38 38 C 36 54, 62 50, 62 68 C 62 82, 38 82, 38 70" strokeWidth="9" /><path d="M 50 12 L 50 88" strokeWidth="9" /></g> },
  { id: "XRP", bg: "from-slate-800 to-slate-900", inner: "from-slate-700 to-black", border: "border-slate-500", rim: "#020617", viewBox: "0 0 100 100", svg: <path d="M80.5 7.5L50 38 19.5 7.5h-10L50 48l40.5-40.5h-10zM19.5 92.5L50 62l30.5 30.5h10L50 52 9.5 92.5h10z" fill="white"/> }
];

function VolumetricChip({ coin, sizeClass }) {
  return (
    <div className={`relative ${sizeClass} preserve-3d drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]`} style={{ transform: 'rotateX(55deg) rotateY(-15deg)' }}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${coin.bg} flex items-center justify-center border-[3px] ${coin.border} shadow-[inset_-6px_-6px_20px_rgba(0,0,0,0.5),inset_6px_6px_20px_rgba(255,255,255,0.4)] z-10 translate-z-[12px]`}>
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,white_10%,transparent_20%,transparent_50%,white_60%,transparent_70%)] opacity-30 animate-[spin_6s_linear_infinite]" />
        <div className={`w-[82%] h-[82%] rounded-full bg-gradient-to-br ${coin.inner} shadow-[inset_6px_12px_24px_rgba(0,0,0,0.6)] flex items-center justify-center border border-white/20 relative z-10`}>
          <svg viewBox={coin.viewBox || "0 0 24 24"} fill="white" className="w-[55%] h-[55%] drop-shadow-xl">{coin.svg}</svg>
        </div>
      </div>
      <div className="absolute inset-0 rounded-full preserve-3d">
         {[...Array(12)].map((_, i) => (
           <div key={i} style={{ transform: `translateZ(${i * 2 - 11}px)`, backgroundColor: coin.rim, opacity: 0.95 }} className="absolute inset-0 rounded-full border border-black/10" />
         ))}
      </div>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${coin.bg} border-[3px] ${coin.border} brightness-[0.25] -translate-z-[12px]`} />
    </div>
  );
}

// =====================================================================
// 3. UNIFIED SCROLL PHYSICS 
// =====================================================================
function SwarmNode({ coin, index, total, smoothY, time }) {
  const baseAngle = (index / total) * Math.PI * 2;
  const x = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800)); 
    const orbitFactor = Math.max(0, 1 - p * 1.5); 
    const radiusX = 650 * orbitFactor;
    const angle = baseAngle + time.get() / 12000; 
    return Math.cos(angle) * radiusX;
  });
  const y = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    const orbitFactor = Math.max(0, 1 - p * 1.5);
    const stackFactor = Math.max(0, (p - 0.2) / 0.8); 
    const radiusY = 280 * orbitFactor; 
    const angle = baseAngle + time.get() / 12000; 
    const orbitY = Math.sin(angle) * radiusY - 80; 
    const stackTargetY = (index - 2) * 75; 
    return (orbitY * orbitFactor) + (stackTargetY * stackFactor);
  });
  const scale = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    const angle = baseAngle + time.get() / 12000; 
    const depthScale = 1 + Math.sin(angle) * 0.3; 
    const orbitScale = depthScale * 0.85; 
    const stackTargetScale = 2.4; 
    return orbitScale * (1 - p) + stackTargetScale * p;
  });
  
  const zIndex = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    const currentAngle = baseAngle + time.get() / 12000;
    return p > 0.6 ? 10 - index : (Math.sin(currentAngle) > 0 ? 50 : 10);
  });

  const filter = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    return `blur(${p * 5}px) brightness(${1 - p * 0.3})`; 
  });
  const opacity = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    return 1 - (p * 0.15); 
  });

  return (
    <motion.div style={{ x, y, scale, filter, opacity, zIndex, position: 'absolute', willChange: "transform, filter" }} className="flex items-center justify-center -ml-[144px] -mt-[144px]">
      <VolumetricChip coin={coin} sizeClass="w-72 h-72" />
    </motion.div>
  );
}

function UnifiedCoinSwarm() {
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { damping: 25, stiffness: 100 });
  const time = useTime();

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden flex items-center justify-center">
      <div className="relative w-0 h-0 flex items-center justify-center overflow-visible">
         {CRYPTO_ASSETS.map((coin, i) => (
           <SwarmNode key={coin.id} coin={coin} index={i} total={CRYPTO_ASSETS.length} smoothY={smoothY} time={time} />
         ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. ANIMATED SCROLL GRADIENT BACKGROUND
// ==========================================
function InteractiveScrollBackground() {
  const { scrollYProgress } = useScroll();
  const glowRef = useRef(null);
  
  const bg1Opacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 0, 0]);
  const bg2Opacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]);
  const bg3Opacity = useTransform(scrollYProgress, [0.6, 0.8, 1], [0, 0, 1]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        requestAnimationFrame(() => {
          glowRef.current.style.background = `radial-gradient(800px circle at ${e.clientX}px ${e.clientY}px, rgba(56, 189, 248, 0.08), transparent 40%)`;
        });
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#02040a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#060a1f] via-[#02040a] to-[#0f0c29] animate-bg-shift bg-[length:200%_200%]" />
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-cyan-900/10 blur-[150px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-900/10 blur-[150px] animate-blob" style={{ animationDelay: '2s' }} />
      <motion.div style={{ opacity: bg1Opacity }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <motion.div style={{ opacity: bg2Opacity }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      <motion.div style={{ opacity: bg3Opacity }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div ref={glowRef} className="absolute inset-0 z-10 transition-opacity duration-300 opacity-100 will-change-[background]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay z-20" />
    </div>
  );
}

// ==========================================
// 5. PROJECT CARDS (MARKETPLACE)
// ==========================================
function ProjectCard({ contractAddress, index }) {
  const { contract } = useContract(contractAddress, POOL_ABI);
  const { data: assetName, isLoading: nameLoading } = useContractRead(contract, "assetName");
  const { data: fundingGoal } = useContractRead(contract, "fundingGoal");
  const { data: totalFunded } = useContractRead(contract, "totalFunded");
  const { data: isClosed } = useContractRead(contract, "isClosed");

  if (nameLoading) return <div className="h-[520px] bg-white/5 animate-pulse rounded-[4rem] border border-white/10" />;
  const progress = Math.min((parseFloat(ethers.utils.formatEther(totalFunded || "0")) / parseFloat(ethers.utils.formatEther(fundingGoal || "1"))) * 100, 100) || 0;

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group relative bg-[#0a0b12]/80 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-12 shadow-2xl flex flex-col justify-between hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)] transition-all duration-500">
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10 text-center">
          <div className="w-18 h-18 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform shadow-inner mx-auto sm:mx-0"><FractalLogo className="w-10 h-10" /></div>
          <span className={`px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase border ${isClosed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
            {isClosed ? 'Syndicate Closed' : 'Live Ledger'}
          </span>
        </div>
        <h3 className="text-4xl font-black text-white mb-6 leading-tight uppercase italic text-center sm:text-left">{assetName}</h3>
        
        {/* ENHANCED UI: Interactive Tooltip for SPV explanation */}
        <Tooltip content="Special Purpose Vehicle (SPV) allows legal fractional ownership of real-world equity via blockchain tokens.">
          <p className="text-slate-400 font-medium mb-12 text-base leading-relaxed text-center sm:text-left italic cursor-help hover:text-slate-300 transition-colors w-fit">
            Fractionalized institutional SPV representing physical real estate equity on-chain. <Info className="w-4 h-4 inline pb-1" />
          </p>
        </Tooltip>

        <div className="bg-black/50 rounded-[2.5rem] p-10 border border-white/5 mb-10 shadow-inner">
          <div className="flex justify-between mb-4">
            <Tooltip content="The percentage of the total funding goal that has currently been pooled by investors.">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest cursor-help hover:text-blue-400 transition-colors flex items-center gap-1">Commitment <Info className="w-3 h-3" /></span>
            </Tooltip>
            <span className="text-blue-400 font-black text-lg">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-8 shadow-inner"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.7)]" /></div>
          <div className="flex justify-between text-2xl font-black text-white">
            <p>{ethers.utils.formatEther(totalFunded || "0")} <span className="text-xs text-slate-600 uppercase font-medium tracking-tighter">ETH</span></p>
            <Tooltip content="The maximum capital cap required to successfully close this ledger and acquire the underlying asset.">
              <p className="text-slate-500 italic cursor-help">{ethers.utils.formatEther(fundingGoal || "0")} <span className="text-xs text-slate-600 uppercase font-bold tracking-tighter">Target</span></p>
            </Tooltip>
          </div>
        </div>
      </div>
      <a href={`/market/${contractAddress}`} className="block w-full">
        <button className="w-full bg-blue-600/10 text-blue-400 border border-blue-500/30 font-black py-7 rounded-[2rem] text-lg hover:bg-blue-600 hover:text-white transition-all shadow-xl uppercase tracking-widest italic group-hover:border-blue-500/60">
          View Due Diligence
        </button>
      </a>
    </motion.div>
  );
}

// ==========================================
// 6. VAULT POSITION CARD 
// ==========================================
function VaultPositionCard({ contractAddress, walletAddress, onFetch }) {
  const { contract } = useContract(contractAddress, POOL_ABI);
  
  const { data: investment, isLoading, refetch: refetchInvestment } = useContractRead(
    contract, 
    "investorDeposits", 
    [walletAddress]
  );
  
  const { data: assetName } = useContractRead(contract, "assetName");

  useEffect(() => {
    if (investment !== undefined) {
      onFetch(contractAddress, investment);
    }
  }, [investment, contractAddress, onFetch]);

  if (isLoading) return (
    <div className="h-32 w-full bg-white/5 animate-pulse rounded-[2.5rem] border border-white/10 mb-6" />
  );
  
  if (!investment || investment.eq(0)) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0b12]/90 backdrop-blur-2xl border border-white/10 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-blue-500/40 transition-all gap-6 mb-6">
      <div className="flex items-center gap-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-[#02040a] rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
          <FractalLogo className="w-10 h-10" />
        </div>
        <div>
          <h4 className="text-2xl lg:text-3xl font-black text-white uppercase italic tracking-tight">{assetName || "Syncing Ledger..."}</h4>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Confirmed Position
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 w-full md:w-auto">
        <div className="text-left sm:text-right w-full sm:w-auto bg-black/40 p-5 rounded-[1.5rem] border border-white/5">
          <Tooltip content="Your total secured capital allocated to this specific institutional ledger.">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1 cursor-help hover:text-blue-400 transition-colors inline-flex items-center gap-1">Syndicate Balance <Info className="w-3 h-3" /></p>
          </Tooltip>
          <p className="text-3xl font-black text-blue-400 block">
            {ethers.utils.formatEther(investment)} <span className="text-sm text-slate-600 uppercase tracking-widest italic">ETH</span>
          </p>
        </div>

        <Web3Button 
          contractAddress={contractAddress} 
          contractAbi={POOL_ABI}
          action={async (contract) => await contract.call("liquidatePosition")} 
          onSuccess={() => {
            toast.success("Position Liquidated Successfully!");
            refetchInvestment(); 
          }}
          className="!bg-red-500/10 !text-red-400 !border !border-red-500/30 hover:!bg-red-500 hover:!text-white !font-black !py-7 !px-8 !rounded-[1.5rem] transition-all uppercase tracking-widest text-xs w-full sm:w-auto"
        >
          Liquidate
        </Web3Button>
      </div>
    </motion.div>
  );
}

// ==========================================
// 7. MAIN PLATFORM WRAPPER
// ==========================================
function PlatformLayout() {
  const [activeTab, setActiveTab] = useState("explore");
  const connectedWallet = useAddress();
  
  const { contract: factoryContract } = useContract(FACTORY_ADDRESS, FACTORY_ABI);
  const { data: deployedPools, refetch: refetchPools } = useContractRead(factoryContract, "getAllPools");

  const [portfolioInvestments, setPortfolioInvestments] = useState({});
  const handleInvestmentFetch = useCallback((pool, amount) => {
    setPortfolioInvestments(prev => {
      if (prev[pool]?.toString() === amount.toString()) return prev;
      return { ...prev, [pool]: amount };
    });
  }, []);

  let totalCommittedETH = ethers.BigNumber.from(0);
  let activePositionsCount = 0;
  Object.values(portfolioInvestments).forEach(amt => {
    if (amt && amt.gt(0)) {
      totalCommittedETH = totalCommittedETH.add(amt);
      activePositionsCount++;
    }
  });

  return (
    <div className="min-h-screen font-sans relative selection:bg-blue-500/30 text-slate-200 pt-8">
      {/* NEW: Institutional Network Ticker injected at the very top */}
      <NetworkTicker />

      <InteractiveScrollBackground />
      <Toaster position="bottom-right" />
      {activeTab === "explore" && <UnifiedCoinSwarm />}

      {/* Adjusted Nav to sit below the new 8px high Ticker */}
      <nav className="absolute top-8 left-0 right-0 z-[100] border-b border-white/5 h-32 flex items-center w-full bg-transparent">
        <div className="w-full px-12 lg:px-24 flex justify-between items-center overflow-visible">
          <div className="flex items-center gap-6 cursor-pointer overflow-visible pr-12 mx-auto sm:mx-0">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-900 to-[#02040a] rounded-2xl flex items-center justify-center shadow-2xl border border-white/10"><FractalLogo className="w-12 h-12" /></div>
            <span className="text-3xl font-black text-white tracking-tighter uppercase italic pr-12 overflow-visible">Syndicate <span className="font-light text-slate-500 not-italic uppercase tracking-widest">Protocol</span></span>
          </div>
          <div className="hidden sm:flex items-center gap-16 lg:gap-20 font-black uppercase tracking-[0.25em] text-base relative z-[100]">
            <button onClick={() => {setActiveTab("explore"); window.scrollTo({top: 0, behavior: 'smooth'})}} className={`${activeTab === 'explore' ? 'text-blue-400 underline underline-offset-8 decoration-2' : 'text-slate-400 hover:text-white transition-colors'}`}>Markets</button>
            <button onClick={() => setActiveTab("portfolio")} className={`${activeTab === 'portfolio' ? 'text-blue-400 underline underline-offset-8 decoration-2' : 'text-slate-400 hover:text-white transition-colors'}`}>Vault</button>
            {connectedWallet?.toLowerCase() === MANAGER_ADDRESS?.toLowerCase() && (
              <button onClick={() => setActiveTab("admin")} className="text-amber-500 flex items-center gap-3 bg-amber-500/10 px-8 py-4 rounded-xl border border-amber-500/20">Terminal <ExternalLink className="w-5 h-5" /></button>
            )}
            <ConnectWallet theme="dark" className="!bg-blue-600 !text-white !font-black !tracking-[0.15em] !uppercase !rounded-2xl !px-12 !py-4 hover:!bg-blue-500 transition-all shadow-xl shadow-blue-600/20" />
          </div>
        </div>
      </nav>

      <main className="relative z-20 pb-40 pt-32">
        <AnimatePresence mode="wait">
          {activeTab === "explore" && (
            <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="relative min-h-[85vh] flex items-center justify-center overflow-visible mb-24 pointer-events-none">
                 <div className="relative z-50 text-center flex flex-col items-center pointer-events-auto overflow-visible pb-[10vh]">
                    <div className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#02040a]/80 backdrop-blur-md border border-blue-500/30 shadow-2xl mb-12 w-max mx-auto">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_15px_rgba(6,182,212,1)]"></div>
                      <p className="text-slate-300 text-xs font-black tracking-widest uppercase italic">System Core Alpha Online</p>
                    </div>
                    <div className="overflow-visible pb-10 text-center px-10">
                      <h1 className="text-[7.5rem] lg:text-[11.5rem] font-black text-white leading-[0.82] tracking-tighter uppercase italic overflow-visible pb-8 pt-8 drop-shadow-[0_20px_60px_rgba(0,0,0,1)] text-center">
                        Institutional<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 animate-text-gradient bg-[length:200%_auto] inline-block pr-32">Liquidity.</span>
                      </h1>
                      <p className="text-2xl text-slate-200 max-w-4xl mx-auto font-bold italic tracking-wide leading-relaxed mt-4 opacity-90">
                        Bridge elite real-world assets into the decentralized economy with volumetric 3D physical-asset backing.
                      </p>
                    </div>
                    <div className="flex gap-10 mt-12 mx-auto">
                      <button onClick={() => {document.getElementById('markets').scrollIntoView({behavior: 'smooth'})}} className="bg-white text-black font-black px-16 py-7 rounded-2xl text-xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl">Start Investing</button>
                      <button className="bg-black/40 backdrop-blur-md border border-white/10 font-black px-16 py-7 rounded-2xl text-xl text-white hover:bg-white/10 transition-all uppercase tracking-widest hover:border-white/30">Whitepaper</button>
                    </div>
                </div>
              </div>

              <div className="w-full py-40 px-12 lg:px-24 relative z-20">
                <div className="flex flex-col items-center mb-32 text-center uppercase italic font-black">
                   <div className="bg-blue-500/10 text-blue-400 px-8 py-3 rounded-full border border-blue-500/30 text-[11px] tracking-widest mb-8 flex items-center gap-3 mx-auto"><Sparkles className="w-4 h-4" /> Operational Core Pipeline</div>
                   <h2 className="text-7xl text-white tracking-tighter pr-10 overflow-visible text-center">Protocol Architecture</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
                  {[
                    { icon: Search, title: "Origination", desc: "Rigorous institutional due diligence and legal structuring of physical assets before protocol pipeline entry." },
                    { icon: Cpu, title: "Tokenization", desc: "Smart contracts synthesize fractional SPV ownership tokens on-chain for borderless digital exchange." },
                    { icon: Network, title: "Pooling", desc: "Aggregating capital into institutional-scale pools with automated risk mitigation protocols." },
                    { icon: Lock, title: "Vaulting", desc: "Managing automated on-chain yields and rental distributions secured by immutable blockchain custody." }
                  ].map((step, i) => (
                    <motion.div key={i} whileHover={{ y: -15 }} className="bg-[#0a0b12]/80 backdrop-blur-2xl border border-white/10 p-14 rounded-[4.5rem] shadow-2xl group hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 flex flex-col items-center">
                       <div className="w-20 h-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mb-12 border border-blue-500/20 text-blue-500 shadow-inner group-hover:scale-110 transition-transform"><step.icon className="w-10 h-10" /></div>
                       <h4 className="text-2xl font-black text-white mb-8 uppercase tracking-tighter italic">{step.title}</h4>
                       <p className="text-slate-400 font-medium leading-relaxed text-lg italic">{step.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div id="markets" className="max-w-[1800px] mx-auto px-12 mt-48 relative z-50">
                 <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-12 mb-12 overflow-visible italic uppercase font-black tracking-tighter">
                   <h2 className="text-7xl text-white pr-20 overflow-visible text-center sm:text-left">Capital Markets</h2>
                   <div className="flex items-center gap-8 bg-[#0a0b12]/80 backdrop-blur-md border border-white/10 px-12 py-6 rounded-3xl text-slate-400 tracking-widest text-xs shadow-inner not-italic"><Activity className="text-emerald-500 w-6 h-6" /> NETWORK OPTIMAL</div>
                 </div>

                 {/* NEW: Purely Visual Market Filtering Dashboard */}
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16 bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-md shadow-2xl">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                      <button className="bg-blue-600 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap shadow-lg">All Assets</button>
                      <button className="bg-transparent text-slate-400 hover:text-white hover:bg-white/5 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap">Live Ledgers</button>
                      <button className="bg-transparent text-slate-400 hover:text-white hover:bg-white/5 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap">Fully Funded</button>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="relative w-full md:w-auto">
                        <div className="flex items-center justify-between bg-black/50 border border-white/10 px-6 py-4 rounded-2xl text-xs font-black text-slate-300 uppercase tracking-widest cursor-pointer hover:border-white/30 transition-all w-full md:w-56 shadow-inner">
                          <span className="flex items-center gap-3"><Filter className="w-4 h-4 text-blue-400" /> Sort By: Newest</span>
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        </div>
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                   {deployedPools?.length > 0 ? (
                     deployedPools.map((addr, i) => <ProjectCard key={i} contractAddress={addr} index={i} />)
                   ) : (
                     <div className="col-span-full py-48 border border-dashed border-white/10 rounded-[5rem] bg-[#0a0b12]/60 backdrop-blur-xl text-center shadow-2xl italic font-black uppercase tracking-tighter">
                        <Boxes className="w-24 h-24 text-slate-600 mx-auto mb-12 not-italic" />
                        <h3 className="text-4xl text-white">Ledger active: empty</h3>
                     </div>
                   )}
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === "admin" && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto mt-12 p-12 lg:p-16 bg-[#0a0b12]/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"></div>
              <div className="mb-12 text-center">
                <h2 className="text-5xl lg:text-6xl font-black text-white uppercase italic mb-4 tracking-tighter">Protocol Factory</h2>
                <p className="text-slate-400 text-lg lg:text-xl font-bold italic tracking-tight">Originate fractionalized asset ledgers via Core v1.0.4.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Asset Identification</label>
                  <input id="assetNameInput" type="text" placeholder="e.g. London Logistics Terminal" className="w-full bg-black/50 border border-white/10 text-white rounded-2xl py-4 px-6 text-lg outline-none focus:border-blue-500 shadow-inner transition-all placeholder:text-slate-700 font-bold italic" />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-4">Funding Cap (ETH)</label>
                  <input id="goalInput" type="number" placeholder="0.5" className="w-full bg-black/50 border border-white/10 text-white rounded-2xl py-4 px-6 text-lg outline-none focus:border-blue-500 shadow-inner transition-all placeholder:text-slate-700 font-bold italic" />
                </div>
              </div>
              
              <Web3Button 
                contractAddress={FACTORY_ADDRESS} 
                contractAbi={FACTORY_ABI}
                action={async (contract) => {
                  const name = document.getElementById('assetNameInput').value;
                  const goal = document.getElementById('goalInput').value;
                  if(!name || !goal) throw new Error("Ensure all parameters are defined.");
                  await contract.call("createPool", [name, ethers.utils.parseEther(goal)]);
                }} 
                onSuccess={() => {
                  toast.success("Asset Ledger Synthesized Successfully!", { style: { borderRadius: '20px', background: '#0a0b12', color: '#fff', border: '1px solid rgba(59,130,246,0.3)' }});
                  document.getElementById('assetNameInput').value = '';
                  document.getElementById('goalInput').value = '';
                  refetchPools(); 
                }}
                onError={(err) => toast.error(err.message || "Synthesis Failed", { style: { borderRadius: '20px', background: '#0a0b12', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' }})}
                className="!w-full !bg-blue-600 !py-5 !rounded-[1.5rem] !font-black !text-xl hover:!bg-blue-500 shadow-2xl transition-all shadow-blue-600/30 uppercase italic"
              >
                Synthesize Ledger Smart Contract
              </Web3Button>
            </motion.div>
          )}
          
          {activeTab === "portfolio" && (
            <motion.div key="portfolio" className="max-w-6xl mx-auto mt-12 px-8 text-center">
               <h2 className="text-6xl lg:text-7xl font-black text-white mb-12 italic uppercase tracking-tighter overflow-visible text-center mx-auto">Asset Vault</h2>
               <div className="grid md:grid-cols-3 gap-8 mb-16 text-left">
                  <div className="bg-[#0a0b12]/90 backdrop-blur-xl border border-white/5 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl hover:border-white/10 transition-all flex flex-col items-center sm:items-start">
                    <Tooltip content="The aggregated value of all your active smart contract positions.">
                      <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] mb-6 cursor-help hover:text-blue-400 transition-colors"><BarChart3 className="w-6 h-6 text-blue-500" /> Total Committed <Info className="w-3 h-3" /></div>
                    </Tooltip>
                    <p className="text-5xl lg:text-6xl font-black text-white">{parseFloat(ethers.utils.formatEther(totalCommittedETH)).toFixed(4)} <span className="text-lg text-slate-600 font-bold italic uppercase tracking-widest">ETH</span></p>
                  </div>
                  <div className="bg-[#0a0b12]/90 backdrop-blur-xl border border-white/5 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl hover:border-white/10 transition-all flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] mb-6"><LineChart className="w-6 h-6 text-emerald-500" /> Yield (Est.)</div>
                    <p className="text-5xl lg:text-6xl font-black text-white">{activePositionsCount > 0 ? "12.4" : "0.0"} <span className="text-lg text-slate-600 font-bold italic uppercase tracking-widest">% APY</span></p>
                  </div>
                  <div className="bg-[#0a0b12]/90 backdrop-blur-xl border border-white/5 p-8 lg:p-10 rounded-[2.5rem] shadow-2xl hover:border-white/10 transition-all flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] mb-6"><Boxes className="w-6 h-6 text-purple-500" /> Active Positions</div>
                    <p className="text-5xl lg:text-6xl font-black text-white">{activePositionsCount} <span className="text-lg text-slate-600 font-bold italic uppercase tracking-widest">Assets</span></p>
                  </div>
               </div>

               <div className="max-w-5xl mx-auto">
                 <div className="space-y-6 text-left">
                   {connectedWallet && deployedPools?.map(poolAddress => (
                      <VaultPositionCard key={poolAddress} contractAddress={poolAddress} walletAddress={connectedWallet} onFetch={handleInvestmentFetch} />
                   ))}
                 </div>
                 {(!connectedWallet || activePositionsCount === 0) && (
                   <div className="bg-[#0a0b12]/60 border border-white/5 p-16 lg:p-24 rounded-[3rem] flex flex-col items-center shadow-2xl backdrop-blur-3xl mx-auto mt-6">
                      <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10 shadow-inner"><ArrowUpRight className="text-slate-700 w-10 h-10" /></div>
                      <h3 className="text-3xl lg:text-4xl font-black text-white mb-4 uppercase italic tracking-tight">No Active Positions</h3>
                      <p className="text-slate-400 text-lg max-w-2xl font-medium leading-relaxed mx-auto text-center">
                        {connectedWallet ? "Please head to the Capital Markets tab to commence your first fractionalized real estate investment." : "Please connect your wallet to view your active institutional portfolio."}
                      </p>
                   </div>
                 )}
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-12 text-center relative z-20 italic uppercase font-black tracking-[0.6em] text-xs"><p className="text-slate-700">Syndicate Protocol v1.0.4 &copy; 2026 | Institutional DeFi Core</p></footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob { 0% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-50px) scale(1.1); } 66% { transform: translate(-20px,20px) scale(0.9); } 100% { transform: translate(0,0) scale(1); } } 
        .animate-blob { animation: blob 15s infinite alternate ease-in-out; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-bg-shift { animation: gradientShift 15s ease infinite; }
        @keyframes textGradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-text-gradient { animation: textGradient 6s linear infinite; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

export default function SyndicateApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen bg-[#02040a] flex items-center justify-center"><div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>;
  return (<QueryClientProvider client={queryClient}><ThirdwebProvider activeChain="sepolia" queryClient={queryClient}><PlatformLayout /></ThirdwebProvider></QueryClientProvider>);
}