"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  ThirdwebProvider, ConnectWallet, Web3Button, useAddress, useContract, useContractRead 
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useTime } from "framer-motion";
import { 
  Building2, Activity, Boxes, Search, Network, Cpu, Lock, ExternalLink, Sparkles, BarChart3, LineChart, 
  ArrowUpRight, CheckCircle2, Globe, Info, Filter, ChevronDown, ShieldAlert, Banknote, MapPin, Droplets, History, Menu
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS; 
const MANAGER_ADDRESS = process.env.NEXT_PUBLIC_MANAGER_ADDRESS;

const ASSET_IMAGES = {
  "0xYourFirstContractAddressHere": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=2000", 
  "0xYourSecondContractAddressHere": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=2000", 
  "default": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" 
};

// ==========================================
// BRANDING & UI COMPONENTS
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

function NetworkTicker({ ethPrice }) {
  const displayPrice = ethPrice > 0 ? ethPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : "Syncing...";
  return (
    <div className="fixed top-0 left-0 w-full bg-[#02040a] border-b border-blue-500/20 overflow-hidden z-[110] h-8 flex items-center">
      <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex gap-8 md:gap-16 whitespace-nowrap text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 w-max">
        {[...Array(4)].map((_, i) => (
          <React.Fragment key={i}>
            <span className="flex items-center gap-1.5"><Globe className="w-2.5 h-2.5 md:w-3 md:h-3" /> SEPOLIA TESTNET</span>
            <span className="text-slate-600">|</span>
            <span className="flex items-center gap-1.5"><Activity className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-500" /> RPC: ONLINE</span>
            <span className="text-slate-600">|</span>
            <span>ETH: {displayPrice} <span className="text-emerald-500">LIVE</span></span>
            <span className="text-slate-600">|</span>
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
}

function LiveActivityFeed() {
  const [activities, setActivities] = useState([
    { id: 1, action: "Committed 0.5 ETH", asset: "London Logistics Terminal", time: "Just now", hash: "0x7a...3f9" },
    { id: 2, action: "Liquidated Position", asset: "Miami Condo SPV", time: "2 mins ago", hash: "0x2b...1a4" }
  ]);

  useEffect(() => {
    const actions = ["Committed 0.25 ETH", "Committed 1.5 ETH", "Liquidated Position", "Claimed Yield"];
    const assets = ["London Terminal", "Miami Condo", "Toronto Center", "PINES 39"];
    
    const interval = setInterval(() => {
      const newActivity = {
        id: Date.now(),
        action: actions[Math.floor(Math.random() * actions.length)],
        asset: assets[Math.floor(Math.random() * assets.length)],
        time: "Just now",
        hash: `0x${Math.floor(Math.random()*16777215).toString(16)}...${Math.floor(Math.random()*16777215).toString(16).slice(-3)}`
      };
      
      setActivities(prev => {
        const updated = [newActivity, ...prev].map(item => {
          if (item.time === "Just now" && item.id !== newActivity.id) return { ...item, time: "1 min ago" };
          return item;
        });
        return updated.slice(0, 3);
      });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-sm bg-[#0a0b12]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl absolute right-12 top-[60vh] hidden xl:block z-50">
      <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-2">
        <History className="w-4 h-4 text-blue-500" /> Network Activity
      </h3>
      <div className="space-y-4">
        <AnimatePresence>
          {activities.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-black/40 border border-white/5 p-4 rounded-2xl">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-bold ${item.action.includes('Liquidated') ? 'text-red-400' : 'text-emerald-400'}`}>{item.action}</span>
                <span className="text-[8px] text-slate-500 uppercase tracking-wider">{item.time}</span>
              </div>
              <p className="text-white text-xs font-black italic tracking-tight truncate">{item.asset}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==========================================
// SMART CONTRACT ABIs
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
  { "inputs": [], "name": "liquidatePosition", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "triggerLiquidation", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "depositRevenue", "outputs": [], "stateMutability": "payable", "type": "function" }
];

// ==========================================
// VOLUMETRIC ASSET LIBRARY
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

function SwarmNode({ coin, index, total, smoothY, time }) {
  const baseAngle = (index / total) * Math.PI * 2;
  const x = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800)); 
    const orbitFactor = Math.max(0, 1 - p * 1.5); 
    return Math.cos(baseAngle + time.get() / 12000) * (650 * orbitFactor);
  });
  const y = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    const orbitFactor = Math.max(0, 1 - p * 1.5);
    const stackFactor = Math.max(0, (p - 0.2) / 0.8); 
    const orbitY = Math.sin(baseAngle + time.get() / 12000) * (280 * orbitFactor) - 80; 
    return (orbitY * orbitFactor) + ((index - 2) * 75 * stackFactor);
  });
  const scale = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    const depthScale = 1 + Math.sin(baseAngle + time.get() / 12000) * 0.3; 
    return (depthScale * 0.85) * (1 - p) + 2.4 * p;
  });
  const zIndex = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    return p > 0.6 ? 10 - index : (Math.sin(baseAngle + time.get() / 12000) > 0 ? 50 : 10);
  });
  const opacity = useTransform(() => {
    const p = Math.min(1, Math.max(0, smoothY.get() / 800));
    return 1 - (p * 0.15); 
  });

  return (
    <motion.div style={{ x, y, scale, opacity, zIndex, position: 'absolute', willChange: "transform" }} className="flex items-center justify-center -ml-[144px] -mt-[144px]">
      <VolumetricChip coin={coin} sizeClass="w-72 h-72" />
    </motion.div>
  );
}

function UnifiedCoinSwarm() {
  const { scrollY } = useScroll();
  const smoothY = useSpring(scrollY, { damping: 25, stiffness: 100 });
  const time = useTime();

  return (
    <div className="hidden lg:flex fixed inset-0 pointer-events-none z-10 overflow-hidden items-center justify-center">
      <div className="relative w-0 h-0 flex items-center justify-center overflow-visible">
         {CRYPTO_ASSETS.map((coin, i) => (
           <SwarmNode key={coin.id} coin={coin} index={i} total={CRYPTO_ASSETS.length} smoothY={smoothY} time={time} />
         ))}
      </div>
    </div>
  );
}

// ==========================================
// ANIMATED SCROLL GRADIENT BACKGROUND
// ==========================================
function InteractiveScrollBackground() {
  const { scrollYProgress } = useScroll();
  const bg1Opacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 0, 0]);
  const bg2Opacity = useTransform(scrollYProgress, [0.3, 0.5, 0.7], [0, 1, 0]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#02040a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#060a1f] via-[#02040a] to-[#0f0c29] bg-[length:200%_200%]" />
      <div className="absolute top-[-10%] left-[-10%] w-[100vw] h-[100vw] lg:w-[50vw] lg:h-[50vw] bg-cyan-900/10 blur-[100px] lg:blur-[150px]" />
      <motion.div style={{ opacity: bg1Opacity }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent" />
      <motion.div style={{ opacity: bg2Opacity }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:2rem_2rem] lg:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.10] mix-blend-overlay z-20" />
    </div>
  );
}

// ==========================================
// PROJECT CARDS
// ==========================================
function ProjectCard({ contractAddress, index, ethPrice }) {
  const { contract } = useContract(contractAddress, POOL_ABI);
  const { data: assetName, isLoading: nameLoading } = useContractRead(contract, "assetName");
  const { data: fundingGoal } = useContractRead(contract, "fundingGoal");
  const { data: totalFunded } = useContractRead(contract, "totalFunded");
  const { data: isClosed } = useContractRead(contract, "isClosed");

  if (nameLoading) return <div className="h-[400px] lg:h-[520px] bg-white/5 animate-pulse rounded-[2rem] lg:rounded-[3rem] border border-white/10" />;
  
  const ethValue = parseFloat(ethers.utils.formatEther(totalFunded || "0"));
  const goalValue = parseFloat(ethers.utils.formatEther(fundingGoal || "0"));
  const progress = Math.min((ethValue / goalValue) * 100, 100) || 0;
  
  const usdValue = ethPrice > 0 ? (ethValue * ethPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : "...";
  const imageUrl = ASSET_IMAGES[contractAddress] || ASSET_IMAGES["default"];

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="group relative bg-[#0a0b12]/80 backdrop-blur-3xl border border-white/10 rounded-[2rem] lg:rounded-[3rem] shadow-2xl flex flex-col hover:border-blue-500/50 transition-all duration-500 overflow-hidden w-full">
      <div className="relative w-full h-48 lg:h-56 overflow-hidden">
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
        <img src={imageUrl} alt={assetName} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b12] to-transparent z-10"></div>
        <div className="absolute top-4 right-4 z-20">
          <span className={`px-3 py-1.5 rounded-full text-[9px] font-black tracking-widest uppercase border backdrop-blur-md ${isClosed ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50' : 'bg-blue-500/20 text-blue-300 border-blue-500/50'}`}>
            {isClosed ? 'Closed' : 'Live'}
          </span>
        </div>
      </div>

      <div className="p-6 lg:p-8 pt-2 relative z-20 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-2xl lg:text-3xl font-black text-white mb-2 leading-tight uppercase italic">{assetName}</h3>
          <p className="text-slate-400 text-[10px] lg:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-6">
            <MapPin className="w-3 h-3" /> Real World Asset
          </p>

          <div className="bg-black/50 rounded-2xl lg:rounded-3xl p-5 lg:p-6 border border-white/5 mb-6 shadow-inner">
            <div className="flex justify-between mb-2">
              <span className="text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">Commitment</span>
              <span className="text-blue-400 font-black text-xs lg:text-sm">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-4 shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.7)]" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-lg lg:text-xl font-black text-white">{ethValue.toFixed(4)} <span className="text-[9px] text-slate-600 uppercase font-medium tracking-tighter">ETH</span></p>
                <p className="text-emerald-500/80 text-[9px] lg:text-[10px] font-bold mt-1 tracking-widest">≈ {usdValue}</p>
              </div>
              <div className="text-right">
                <p className="text-sm lg:text-lg font-black text-slate-400 italic">{goalValue.toFixed(4)} <span className="text-[9px] text-slate-600 uppercase font-bold tracking-tighter">Target</span></p>
              </div>
            </div>
          </div>
        </div>

        <a href={`/market/${contractAddress}`} className="block w-full">
          <button className="w-full bg-blue-600/10 text-blue-400 border border-blue-500/30 font-black py-4 rounded-xl lg:rounded-[1.5rem] text-xs lg:text-sm hover:bg-blue-600 hover:text-white transition-all shadow-xl uppercase tracking-widest italic group-hover:border-blue-500/60">
            View Due Diligence
          </button>
        </a>
      </div>
    </motion.div>
  );
}

// ==========================================
// VAULT POSITION CARD
// ==========================================
function VaultPositionCard({ contractAddress, walletAddress, onFetch, ethPrice }) {
  const { contract } = useContract(contractAddress, POOL_ABI);
  const { data: investment, isLoading, refetch: refetchInvestment } = useContractRead(contract, "investorDeposits", [walletAddress]);
  const { data: assetName } = useContractRead(contract, "assetName");

  useEffect(() => {
    if (investment !== undefined) {
      onFetch(contractAddress, investment);
    }
  }, [investment, contractAddress, onFetch]);

  if (isLoading) return <div className="h-32 w-full bg-white/5 animate-pulse rounded-2xl lg:rounded-[2.5rem] border border-white/10 mb-6" />;
  if (!investment || investment.eq(0)) return null;

  const ethValue = parseFloat(ethers.utils.formatEther(investment));
  const usdValue = ethPrice > 0 ? (ethValue * ethPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : "...";
  const imageUrl = ASSET_IMAGES[contractAddress] || ASSET_IMAGES["default"];

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0b12]/90 backdrop-blur-2xl border border-white/10 p-5 lg:p-8 rounded-2xl lg:rounded-[2rem] shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center hover:border-blue-500/40 transition-all gap-5 lg:gap-6 mb-4 lg:mb-6 group w-full">
      <div className="flex items-center gap-4 lg:gap-6 w-full md:w-auto">
        <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl lg:rounded-2xl border border-white/10 shadow-inner overflow-hidden relative shrink-0">
          <img src={imageUrl} alt={assetName} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        </div>
        <div>
          <h4 className="text-lg lg:text-2xl font-black text-white uppercase italic tracking-tight">{assetName || "Syncing Ledger..."}</h4>
          <p className="text-slate-500 text-[9px] lg:text-[10px] font-bold uppercase tracking-[0.2em] mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Confirmed
          </p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 lg:gap-6 w-full md:w-auto mt-4 md:mt-0">
        <div className="text-left sm:text-right w-full sm:w-auto bg-black/40 px-5 py-3 lg:px-6 lg:py-4 rounded-xl lg:rounded-2xl border border-white/5">
          <p className="text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Syndicate Balance</p>
          <p className="text-xl lg:text-2xl font-black text-blue-400">
            {ethValue.toFixed(4)} <span className="text-[10px] lg:text-xs text-slate-600 uppercase tracking-widest italic">ETH</span>
          </p>
          <p className="text-emerald-500/80 text-[9px] lg:text-[10px] font-bold mt-1 tracking-widest">≈ {usdValue}</p>
        </div>

        <Web3Button 
          contractAddress={contractAddress} 
          contractAbi={POOL_ABI}
          action={async (contract) => await contract.call("liquidatePosition")} 
          onSuccess={() => { toast.success("Position Liquidated Successfully!"); refetchInvestment(); }}
          className="!bg-red-500/10 !text-red-400 !border !border-red-500/30 hover:!bg-red-500 hover:!text-white !font-black !py-3 lg:!py-5 !px-6 lg:!px-8 !rounded-xl lg:!rounded-[1.2rem] transition-all uppercase tracking-widest text-[10px] lg:text-xs w-full sm:w-auto"
        >
          Liquidate
        </Web3Button>
      </div>
    </motion.div>
  );
}

function LedgerOption({ contractAddress }) {
  const { contract } = useContract(contractAddress, POOL_ABI);
  const { data: assetName } = useContractRead(contract, "assetName");
  const formattedAddress = `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`;
  return <option value={contractAddress}>{assetName ? `${assetName} (${formattedAddress})` : `Syncing... (${formattedAddress})`}</option>;
}

// ==========================================
// MAIN PLATFORM WRAPPER
// ==========================================
function PlatformLayout() {
  const [activeTab, setActiveTab] = useState("explore");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const connectedWallet = useAddress();
  
  const { contract: factoryContract } = useContract(FACTORY_ADDRESS, FACTORY_ABI);
  const { data: deployedPools, refetch: refetchPools } = useContractRead(factoryContract, "getAllPools");

  const [selectedLedger, setSelectedLedger] = useState("");
  const [revenueAmount, setRevenueAmount] = useState("");
  const [portfolioInvestments, setPortfolioInvestments] = useState({});
  const [ethPrice, setEthPrice] = useState(0);

  useEffect(() => {
    fetch("https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT")
      .then(res => res.json())
      .then(data => setEthPrice(parseFloat(data.price)))
      .catch(console.error);
  }, []);

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

  const portfolioEthValue = parseFloat(ethers.utils.formatEther(totalCommittedETH));
  const portfolioUsdValue = ethPrice > 0 ? (portfolioEthValue * ethPrice).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : "...";

  return (
    <div className="min-h-screen font-sans relative selection:bg-blue-500/30 text-slate-200 pt-8 overflow-x-hidden">
      <NetworkTicker ethPrice={ethPrice} />
      <InteractiveScrollBackground />
      <Toaster position="bottom-right" />
      {activeTab === "explore" && <UnifiedCoinSwarm />}
      {activeTab === "explore" && <LiveActivityFeed />}

      {/* 🌟 MOBILE OPTIMIZED NAVIGATION 🌟 */}
      <nav className="absolute top-8 left-0 right-0 z-[100] border-b border-white/5 py-4 lg:h-32 flex flex-col justify-center w-full bg-[#02040a]/80 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none">
        <div className="w-full px-6 lg:px-12 xl:px-24 flex flex-col lg:flex-row justify-between items-center gap-6">
          
          <div className="flex justify-between items-center w-full lg:w-auto">
            <div className="flex items-center gap-4 cursor-pointer">
              <div className="w-10 h-10 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-900 to-[#02040a] rounded-xl lg:rounded-2xl flex items-center justify-center shadow-2xl border border-white/10">
                <FractalLogo className="w-6 h-6 lg:w-12 lg:h-12" />
              </div>
              <span className="text-xl lg:text-3xl font-black text-white tracking-tighter uppercase italic">
                Syndicate <span className="font-light text-slate-500 not-italic uppercase tracking-widest hidden sm:inline-block">Protocol</span>
              </span>
            </div>
            
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 text-slate-400 hover:text-white">
              <Menu className="w-6 h-6" />
            </button>
          </div>

          <div className={`${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row items-center gap-6 lg:gap-10 font-black uppercase tracking-[0.2em] text-xs lg:text-sm w-full lg:w-auto bg-[#0a0b12]/90 lg:bg-transparent p-6 lg:p-0 rounded-2xl border border-white/10 lg:border-none shadow-2xl lg:shadow-none`}>
            <button onClick={() => {setActiveTab("explore"); setMobileMenuOpen(false); window.scrollTo({top: 0, behavior: 'smooth'})}} className={`${activeTab === 'explore' ? 'text-blue-400 underline underline-offset-8 decoration-2' : 'text-slate-400 hover:text-white'}`}>Markets</button>
            <button onClick={() => {setActiveTab("portfolio"); setMobileMenuOpen(false);}} className={`${activeTab === 'portfolio' ? 'text-blue-400 underline underline-offset-8 decoration-2' : 'text-slate-400 hover:text-white'}`}>Vault</button>
            
            {connectedWallet?.toLowerCase() === MANAGER_ADDRESS?.toLowerCase() && (
              <button onClick={() => {setActiveTab("admin"); setMobileMenuOpen(false);}} className="text-amber-500 flex items-center gap-2 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">Terminal <ExternalLink className="w-3 h-3" /></button>
            )}
            
            <a href="https://sepoliafaucet.com/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-blue-400 bg-blue-500/10 border border-blue-500/30 px-4 py-2 rounded-lg hover:bg-blue-500 hover:text-white transition-all w-full lg:w-auto">
              <Droplets className="w-3 h-3" /> Get Testnet ETH
            </a>

            <div className="w-full lg:w-auto flex justify-center mt-2 lg:mt-0">
              <ConnectWallet theme="dark" className="!bg-blue-600 !text-white !font-black !tracking-[0.1em] !uppercase !rounded-xl !px-6 !py-2.5 hover:!bg-blue-500 transition-all shadow-xl shadow-blue-600/20 !w-full lg:!w-auto" />
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-20 pb-20 pt-32 lg:pt-40">
        <AnimatePresence mode="wait">
          
          {/* ========================================== */}
          {/* TAB 1: EXPLORE (MARKETS)                   */}
          {/* ========================================== */}
          {activeTab === "explore" && (
            <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* HERO */}
              <div className="relative min-h-[70vh] lg:min-h-[85vh] flex items-center justify-center overflow-visible mb-16 lg:mb-24 pointer-events-none mt-16 lg:mt-0">
                 <div className="relative z-50 text-center flex flex-col items-center pointer-events-auto px-6 lg:px-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 rounded-full bg-[#02040a]/80 backdrop-blur-md border border-blue-500/30 shadow-2xl mb-8 lg:mb-12 w-max mx-auto">
                      <div className="w-2 h-2 lg:w-3 lg:h-3 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_15px_rgba(6,182,212,1)]"></div>
                      <p className="text-slate-300 text-[9px] lg:text-xs font-black tracking-widest uppercase italic">System Core Alpha Online</p>
                    </div>
                    
                    <h1 className="text-5xl sm:text-7xl lg:text-[11.5rem] font-black text-white leading-[0.9] lg:leading-[0.82] tracking-tighter uppercase italic overflow-visible pb-4 lg:pb-8 drop-shadow-[0_20px_60px_rgba(0,0,0,1)] text-center">
                      Institutional<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 pr-4 lg:pr-32 break-words block sm:inline-block">Liquidity.</span>
                    </h1>
                    
                    <p className="text-lg lg:text-2xl text-slate-300 max-w-sm lg:max-w-4xl mx-auto font-bold italic tracking-wide leading-relaxed mt-4 opacity-90 px-4">
                      Bridge elite real-world assets into the decentralized economy with volumetric 3D physical-asset backing.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 lg:gap-10 mt-10 lg:mt-12 mx-auto w-full sm:w-auto px-6">
                      <button onClick={() => {document.getElementById('markets').scrollIntoView({behavior: 'smooth'})}} className="bg-white text-black font-black px-8 py-5 lg:px-16 lg:py-7 rounded-xl lg:rounded-2xl text-sm lg:text-xl hover:bg-blue-600 hover:text-white transition-all shadow-2xl w-full sm:w-auto">Start Investing</button>
                      <button className="bg-black/40 backdrop-blur-md border border-white/10 font-black px-8 py-5 lg:px-16 lg:py-7 rounded-xl lg:rounded-2xl text-sm lg:text-xl text-white hover:bg-white/10 transition-all uppercase tracking-widest w-full sm:w-auto">Whitepaper</button>
                    </div>
                </div>
              </div>

              {/* ARCHITECTURE */}
              <div className="w-full py-20 lg:py-40 px-6 lg:px-24 relative z-20">
                <div className="flex flex-col items-center mb-16 lg:mb-32 text-center uppercase italic font-black">
                   <div className="bg-blue-500/10 text-blue-400 px-6 py-2 rounded-full border border-blue-500/30 text-[9px] lg:text-[11px] tracking-widest mb-6 lg:mb-8 flex items-center gap-2 mx-auto"><Sparkles className="w-3 h-3" /> Core Pipeline</div>
                   <h2 className="text-4xl lg:text-7xl text-white tracking-tighter text-center px-4">Protocol Architecture</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-12 text-center">
                  {[
                    { icon: Search, title: "Origination", desc: "Rigorous institutional due diligence and structuring of assets." },
                    { icon: Cpu, title: "Tokenization", desc: "Smart contracts synthesize fractional SPV ownership tokens." },
                    { icon: Network, title: "Pooling", desc: "Aggregating capital with automated risk mitigation protocols." },
                    { icon: Lock, title: "Vaulting", desc: "Managing automated on-chain yields and rental distributions." }
                  ].map((step, i) => (
                    <div key={i} className="bg-[#0a0b12]/80 backdrop-blur-2xl border border-white/10 p-8 lg:p-14 rounded-[2rem] lg:rounded-[4.5rem] shadow-2xl flex flex-col items-center">
                       <div className="w-16 h-16 lg:w-20 lg:h-20 bg-blue-600/10 rounded-2xl lg:rounded-3xl flex items-center justify-center mb-6 lg:mb-12 border border-blue-500/20 text-blue-500 shadow-inner"><step.icon className="w-8 h-8 lg:w-10 lg:h-10" /></div>
                       <h4 className="text-xl lg:text-2xl font-black text-white mb-4 lg:mb-8 uppercase tracking-tighter italic">{step.title}</h4>
                       <p className="text-slate-400 font-medium leading-relaxed text-sm lg:text-lg italic">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* MARKETS GRID */}
              <div id="markets" className="max-w-[1800px] mx-auto px-6 lg:px-12 mt-24 lg:mt-48 relative z-50">
                 <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 lg:gap-12 mb-10 lg:mb-12 italic uppercase font-black tracking-tighter text-center md:text-left">
                   <h2 className="text-5xl lg:text-7xl text-white">Capital Markets</h2>
                   <div className="flex items-center gap-4 lg:gap-8 bg-[#0a0b12]/80 backdrop-blur-md border border-white/10 px-6 py-4 lg:px-12 lg:py-6 rounded-2xl lg:rounded-3xl text-slate-400 tracking-widest text-[10px] lg:text-xs shadow-inner not-italic"><Activity className="text-emerald-500 w-4 h-4 lg:w-6 lg:h-6" /> NETWORK OPTIMAL</div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                   {deployedPools?.length > 0 ? (
                     deployedPools.map((addr, i) => <ProjectCard key={i} contractAddress={addr} index={i} ethPrice={ethPrice} />)
                   ) : (
                     <div className="col-span-full py-24 lg:py-48 border border-dashed border-white/10 rounded-3xl lg:rounded-[5rem] bg-[#0a0b12]/60 backdrop-blur-xl text-center shadow-2xl italic font-black uppercase tracking-tighter">
                        <Boxes className="w-16 h-16 lg:w-24 lg:h-24 text-slate-600 mx-auto mb-6 lg:mb-12 not-italic" />
                        <h3 className="text-2xl lg:text-4xl text-white">Ledger active: empty</h3>
                     </div>
                   )}
                 </div>
              </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 2: PORTFOLIO (VAULT)                   */}
          {/* ========================================== */}
          {activeTab === "portfolio" && (
            <motion.div key="portfolio" className="max-w-6xl mx-auto mt-24 lg:mt-12 px-6 lg:px-8 text-center">
               <h2 className="text-5xl lg:text-7xl font-black text-white mb-10 lg:mb-12 italic uppercase tracking-tighter text-center mx-auto">Asset Vault</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10 lg:mb-16 text-left">
                  <div className="bg-[#0a0b12]/90 backdrop-blur-xl border border-white/5 p-6 lg:p-10 rounded-2xl lg:rounded-[2.5rem] shadow-2xl flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2 lg:gap-3 text-slate-500 font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] mb-4 lg:mb-6"><BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-blue-500" /> Total Committed</div>
                    <p className="text-3xl lg:text-5xl font-black text-white">{portfolioEthValue.toFixed(4)} <span className="text-sm lg:text-lg text-slate-600 font-bold italic uppercase tracking-widest">ETH</span></p>
                    <p className="text-emerald-500/80 text-xs lg:text-sm font-bold mt-1 lg:mt-2 tracking-widest">≈ {portfolioUsdValue}</p>
                  </div>
                  <div className="bg-[#0a0b12]/90 backdrop-blur-xl border border-white/5 p-6 lg:p-10 rounded-2xl lg:rounded-[2.5rem] shadow-2xl flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2 lg:gap-3 text-slate-500 font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] mb-4 lg:mb-6"><LineChart className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" /> Yield (Est.)</div>
                    <p className="text-3xl lg:text-5xl font-black text-white">{activePositionsCount > 0 ? "12.4" : "0.0"} <span className="text-sm lg:text-lg text-slate-600 font-bold italic uppercase tracking-widest">% APY</span></p>
                  </div>
                  <div className="bg-[#0a0b12]/90 backdrop-blur-xl border border-white/5 p-6 lg:p-10 rounded-2xl lg:rounded-[2.5rem] shadow-2xl flex flex-col items-center sm:items-start">
                    <div className="flex items-center gap-2 lg:gap-3 text-slate-500 font-black uppercase text-[10px] lg:text-xs tracking-[0.3em] mb-4 lg:mb-6"><Boxes className="w-5 h-5 lg:w-6 lg:h-6 text-purple-500" /> Active Positions</div>
                    <p className="text-3xl lg:text-5xl font-black text-white">{activePositionsCount} <span className="text-sm lg:text-lg text-slate-600 font-bold italic uppercase tracking-widest">Assets</span></p>
                  </div>
               </div>

               <div className="max-w-5xl mx-auto">
                 <div className="space-y-4 lg:space-y-6 text-left">
                   {connectedWallet && deployedPools?.map(poolAddress => (
                      <VaultPositionCard key={poolAddress} contractAddress={poolAddress} walletAddress={connectedWallet} onFetch={handleInvestmentFetch} ethPrice={ethPrice} />
                   ))}
                 </div>
                 {(!connectedWallet || activePositionsCount === 0) && (
                   <div className="bg-[#0a0b12]/60 border border-white/5 p-10 lg:p-24 rounded-[2rem] lg:rounded-[3rem] flex flex-col items-center shadow-2xl backdrop-blur-3xl mx-auto mt-6">
                      <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 lg:mb-8 border border-white/10 shadow-inner"><ArrowUpRight className="text-slate-700 w-8 h-8 lg:w-10 lg:h-10" /></div>
                      <h3 className="text-xl lg:text-4xl font-black text-white mb-4 uppercase italic tracking-tight text-center">No Active Positions</h3>
                      <p className="text-slate-400 text-sm lg:text-lg max-w-2xl font-medium leading-relaxed mx-auto text-center px-4">
                        {connectedWallet ? "Please head to the Capital Markets tab to commence your first fractionalized real estate investment." : "Please connect your wallet to view your active institutional portfolio."}
                      </p>
                   </div>
                 )}
               </div>
            </motion.div>
          )}

          {/* ========================================== */}
          {/* TAB 3: ADMIN (MANAGER ONLY)                */}
          {/* ========================================== */}
          {activeTab === "admin" && (
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto mt-24 lg:mt-12 p-6 lg:p-16 bg-[#0a0b12]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] lg:rounded-[3rem] shadow-2xl relative overflow-hidden mx-4 lg:mx-auto">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"></div>
              
              <div className="mb-8 lg:mb-12 text-center">
                <h2 className="text-3xl lg:text-6xl font-black text-white uppercase italic mb-2 lg:mb-4 tracking-tighter">Protocol Factory</h2>
                <p className="text-slate-400 text-sm lg:text-xl font-bold italic tracking-tight">Originate fractionalized asset ledgers via Core v1.0.4.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
                <div className="space-y-2 lg:space-y-3">
                  <label className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-2 lg:ml-4">Asset Identification</label>
                  <input id="assetNameInput" type="text" placeholder="e.g. London Terminal" className="w-full bg-black/50 border border-white/10 text-white rounded-xl lg:rounded-2xl py-3 px-4 lg:py-4 lg:px-6 text-sm lg:text-lg outline-none focus:border-blue-500 shadow-inner transition-all placeholder:text-slate-700 font-bold italic" />
                </div>
                <div className="space-y-2 lg:space-y-3">
                  <label className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-2 lg:ml-4">Funding Cap (ETH)</label>
                  <input id="goalInput" type="number" placeholder="0.5" className="w-full bg-black/50 border border-white/10 text-white rounded-xl lg:rounded-2xl py-3 px-4 lg:py-4 lg:px-6 text-sm lg:text-lg outline-none focus:border-blue-500 shadow-inner transition-all placeholder:text-slate-700 font-bold italic" />
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
                  toast.success("Asset Ledger Synthesized Successfully!");
                  document.getElementById('assetNameInput').value = '';
                  document.getElementById('goalInput').value = '';
                  refetchPools(); 
                }}
                className="!w-full !bg-blue-600 !py-4 lg:!py-5 !rounded-xl lg:!rounded-[1.5rem] !font-black !text-sm lg:!text-xl hover:!bg-blue-500 shadow-2xl transition-all shadow-blue-600/30 uppercase italic"
              >
                Synthesize Ledger Contract
              </Web3Button>

              <div className="mt-12 lg:mt-20 pt-10 lg:pt-16 border-t border-white/10">
                <div className="mb-8 lg:mb-12 text-center">
                  <h3 className="text-2xl lg:text-4xl font-black text-white uppercase italic mb-2 lg:mb-4 tracking-tighter">Active Ledger Management</h3>
                  <p className="text-slate-400 text-xs lg:text-base font-bold italic tracking-tight px-4">Execute emergency protocols or distribute rental yields directly to investors.</p>
                </div>

                <div className="space-y-6 lg:space-y-8 bg-white/5 p-6 lg:p-10 rounded-2xl lg:rounded-[2.5rem] border border-white/10 shadow-inner">
                  <div className="space-y-3">
                     <label className="text-[10px] lg:text-xs font-black text-slate-500 uppercase tracking-[0.3em] ml-2 lg:ml-4">Target Ledger Address</label>
                     <div className="relative">
                       <select 
                          value={selectedLedger}
                          onChange={(e) => setSelectedLedger(e.target.value)}
                          className="w-full bg-black/80 border border-white/20 text-blue-400 rounded-xl lg:rounded-2xl py-4 lg:py-5 px-4 lg:px-6 text-sm lg:text-lg outline-none focus:border-blue-500 transition-all font-black italic appearance-none cursor-pointer"
                       >
                         <option value="" className="text-slate-600">Select an active ledger...</option>
                         {deployedPools?.map(addr => <LedgerOption key={addr} contractAddress={addr} />)}
                       </select>
                       <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none w-5 h-5 lg:w-6 lg:h-6" />
                     </div>
                  </div>

                  {selectedLedger && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 pt-4">
                      <div className="bg-red-500/5 border border-red-500/20 p-6 lg:p-8 rounded-2xl lg:rounded-3xl flex flex-col justify-between gap-6">
                        <div>
                          <h4 className="text-red-400 text-sm lg:text-base font-black uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4 lg:w-5 lg:h-5" /> Emergency Protocol</h4>
                          <p className="text-xs lg:text-sm text-slate-400 font-medium italic">Instantly aborts the ledger and unlocks the Vault so all investors can claim a 100% refund.</p>
                        </div>
                        <Web3Button 
                          contractAddress={selectedLedger} 
                          contractAbi={POOL_ABI}
                          action={async (contract) => await contract.call("triggerLiquidation")} 
                          onSuccess={() => toast.success("Ledger Aborted. Vault unlocked for refunds.")}
                          className="!w-full !bg-red-500/10 !text-red-400 !border !border-red-500/30 hover:!bg-red-600 hover:!text-white !font-black !py-3 lg:!py-4 !rounded-xl lg:!rounded-2xl transition-all uppercase tracking-widest text-xs lg:text-sm"
                        >
                          Trigger Liquidation
                        </Web3Button>
                      </div>

                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 lg:p-8 rounded-2xl lg:rounded-3xl flex flex-col justify-between gap-6">
                        <div>
                          <h4 className="text-emerald-400 text-sm lg:text-base font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Banknote className="w-4 h-4 lg:w-5 lg:h-5" /> Distribute Yield</h4>
                          <p className="text-xs lg:text-sm text-slate-400 font-medium italic mb-4">Inject property rental revenue directly into the contract for investors to claim.</p>
                          <input 
                            type="number" 
                            placeholder="Amount (ETH)" 
                            value={revenueAmount}
                            onChange={(e) => setRevenueAmount(e.target.value)}
                            className="w-full bg-black/50 border border-emerald-500/30 text-white rounded-xl py-3 px-4 text-sm outline-none focus:border-emerald-400 shadow-inner font-bold placeholder:text-slate-600" 
                          />
                        </div>
                        <Web3Button 
                          contractAddress={selectedLedger} 
                          contractAbi={POOL_ABI}
                          action={async (contract) => {
                            if (!revenueAmount) throw new Error("Enter revenue amount");
                            await contract.call("depositRevenue", [], { value: ethers.utils.parseEther(revenueAmount) });
                          }} 
                          onSuccess={() => {
                            toast.success("Yield Injected Successfully!");
                            setRevenueAmount("");
                          }}
                          className="!w-full !bg-emerald-500/10 !text-emerald-400 !border !border-emerald-500/30 hover:!bg-emerald-600 hover:!text-white !font-black !py-3 lg:!py-4 !rounded-xl lg:!rounded-2xl transition-all uppercase tracking-widest text-xs lg:text-sm"
                        >
                          Inject Capital
                        </Web3Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-8 lg:py-12 text-center relative z-20 italic uppercase font-black tracking-[0.4em] lg:tracking-[0.6em] text-[8px] lg:text-xs">
        <p className="text-slate-700">Syndicate Protocol v1.0.4 &copy; 2026 | Institutional DeFi Core</p>
      </footer>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob { 0% { transform: translate(0,0) scale(1); } 33% { transform: translate(30px,-50px) scale(1.1); } 66% { transform: translate(-20px,20px) scale(0.9); } 100% { transform: translate(0,0) scale(1); } } 
        .animate-blob { animation: blob 15s infinite alternate ease-in-out; }
        @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        .animate-bg-shift { animation: gradientShift 15s ease infinite; }
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