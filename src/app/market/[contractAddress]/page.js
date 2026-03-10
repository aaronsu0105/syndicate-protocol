"use client";
import React, { useState } from "react";
import { 
  ThirdwebProvider, 
  ConnectWallet, 
  Web3Button, 
  useContract, 
  useContractRead 
} from "@thirdweb-dev/react";
import { ethers } from "ethers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Building2, ShieldCheck, MapPin, 
  TrendingUp, FileText, CheckCircle2, AlertCircle, Boxes
} from "lucide-react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

// ==========================================
// 1. SMART CONTRACT ABI
// ==========================================
const POOL_ABI = [
  { "inputs": [], "name": "invest", "outputs": [], "stateMutability": "payable", "type": "function" },
  { "inputs": [], "name": "assetName", "outputs": [{ "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "fundingGoal", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalFunded", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "isClosed", "outputs": [{ "type": "bool" }], "stateMutability": "view", "type": "function" }
];

function AssetDetailLayout({ contractAddress }) {
  const [investAmount, setInvestAmount] = useState("");
  
  const { contract } = useContract(contractAddress, POOL_ABI);
  const { data: assetName, isLoading } = useContractRead(contract, "assetName");
  const { data: fundingGoal } = useContractRead(contract, "fundingGoal");
  const { data: totalFunded } = useContractRead(contract, "totalFunded");
  const { data: isClosed } = useContractRead(contract, "isClosed");

  const progress = Math.min((parseFloat(ethers.utils.formatEther(totalFunded || "0")) / parseFloat(ethers.utils.formatEther(fundingGoal || "1"))) * 100, 100) || 0;

  if (isLoading) {
    return <div className="min-h-screen bg-[#02040a] flex items-center justify-center"><div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#02040a] font-sans relative selection:bg-blue-500/30 text-slate-200">
      <Toaster position="bottom-right" />
      
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[20%] w-[60vw] h-[60vw] bg-blue-900/10 blur-[200px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      </div>

      <nav className="relative z-50 border-b border-white/5 h-32 flex items-center w-full bg-[#02040a]/60 backdrop-blur-3xl">
        <div className="w-full px-12 lg:px-24 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:bg-blue-600/20 group-hover:border-blue-500/30 transition-all">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-black uppercase tracking-[0.2em] text-sm">Return to Markets</span>
          </Link>
          <ConnectWallet theme="dark" className="!bg-blue-600 !text-white !font-black !tracking-[0.15em] !uppercase !rounded-2xl !px-12 !py-4 hover:!bg-blue-500 transition-all shadow-xl shadow-blue-600/20" />
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 lg:px-12 pt-20 pb-40">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <span className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border ${isClosed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
              {isClosed ? 'Syndicate Closed' : 'Live Ledger'}
            </span>
            <span className="px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase border bg-white/5 text-slate-400 border-white/10 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" /> Audited SPV
            </span>
          </div>
          <h1 className="text-6xl lg:text-8xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
            {assetName}
          </h1>
          <p className="text-2xl text-slate-400 font-bold italic font-serif">Contract: <span className="font-mono text-xl">{contractAddress}</span></p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-8">
            <div className="w-full h-80 bg-gradient-to-br from-slate-900 to-[#0a0b12] rounded-[3rem] border border-white/10 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
               <Building2 className="w-20 h-20 text-slate-700 mb-4" />
               <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-sm">Asset Visualization Unavailable</p>
            </div>

            <div className="bg-[#0a0b12]/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-12 shadow-2xl">
              <h3 className="text-3xl font-black text-white uppercase italic mb-10 tracking-tight">Institutional Due Diligence</h3>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-xs tracking-widest"><MapPin className="w-4 h-4 text-blue-500" /> Jurisdiction</div>
                  <p className="text-2xl font-bold text-white">London, UK</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-xs tracking-widest"><TrendingUp className="w-4 h-4 text-emerald-500" /> Target APY</div>
                  <p className="text-2xl font-bold text-white">12.4% <span className="text-sm text-slate-500">Projected</span></p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-xs tracking-widest"><Boxes className="w-4 h-4 text-purple-500" /> Asset Class</div>
                  <p className="text-2xl font-bold text-white">Commercial Logistics</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-slate-500 font-black uppercase text-xs tracking-widest"><FileText className="w-4 h-4 text-amber-500" /> Legal Structure</div>
                  <p className="text-2xl font-bold text-white">Fractional SPV LLC</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-blue-600/5 border border-blue-500/20 rounded-[3rem] p-10 lg:p-12 shadow-[0_0_50px_rgba(59,130,246,0.1)] sticky top-40">
              <h3 className="text-3xl font-black text-white uppercase italic mb-8 tracking-tight">Commit Capital</h3>
              
              <div className="bg-black/50 rounded-[2rem] p-8 border border-white/5 mb-10 shadow-inner">
                <div className="flex justify-between mb-4"><span className="text-xs font-black text-slate-500 uppercase tracking-widest">Funded</span><span className="text-blue-400 font-black text-xl">{progress.toFixed(1)}%</span></div>
                <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden mb-6 shadow-inner"><motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.7)]" /></div>
                <div className="flex justify-between text-2xl font-black text-white"><p>{ethers.utils.formatEther(totalFunded || "0")} <span className="text-xs text-slate-600 uppercase tracking-widest">ETH</span></p><p className="text-slate-500 italic">{ethers.utils.formatEther(fundingGoal || "0")} <span className="text-xs text-slate-600 uppercase tracking-widest">Cap</span></p></div>
              </div>

              <div className="space-y-4 mb-10">
                <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Allocation Amount (ETH)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={investAmount}
                    onChange={(e) => setInvestAmount(e.target.value)}
                    placeholder="0.00" 
                    disabled={isClosed}
                    className="w-full bg-black/60 border border-white/10 text-white rounded-[2rem] py-6 px-8 text-3xl font-black italic outline-none focus:border-blue-500 transition-all placeholder:text-slate-800 disabled:opacity-50" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 font-black italic text-xl">ETH</div>
                </div>
              </div>

              <div className="flex items-start gap-4 mb-10 bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl text-amber-500/80 text-sm font-medium leading-relaxed">
                <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                <p>Smart contract interaction is immutable. Ensure your allocation aligns with your institutional risk profile before synthesizing LP tokens.</p>
              </div>

              {/* FIX: contractAbi={POOL_ABI} injected here */}
              <Web3Button 
                contractAddress={contractAddress} 
                contractAbi={POOL_ABI}
                action={async (contract) => {
                  if(!investAmount || isNaN(investAmount) || Number(investAmount) <= 0) {
                    throw new Error("Please enter a valid ETH amount.");
                  }
                  await contract.call("invest", [], { value: ethers.utils.parseEther(investAmount.toString()) });
                }} 
                onSuccess={() => {
                  toast.success("Capital Committed Successfully!", { style: { borderRadius: '20px', background: '#0a0b12', color: '#fff', border: '1px solid rgba(59,130,246,0.3)' }});
                  setInvestAmount("");
                }}
                onError={(err) => toast.error(err.message || "Transaction Failed", { style: { borderRadius: '20px', background: '#0a0b12', color: '#fff', border: '1px solid rgba(239,68,68,0.3)' }})}
                isDisabled={isClosed || !investAmount} 
                className="!w-full !bg-blue-600 !text-white !font-black !py-8 !rounded-[2rem] !text-2xl hover:!bg-blue-500 !transition-all shadow-2xl shadow-blue-600/20 uppercase italic tracking-widest disabled:!opacity-50 disabled:!bg-slate-800"
              >
                {isClosed ? "Ledger Closed" : "Synthesize Tokens"}
              </Web3Button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function Page({ params }) {
  const contractAddress = params?.contractAddress;
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider activeChain="sepolia" queryClient={queryClient}>
        <AssetDetailLayout contractAddress={contractAddress} />
      </ThirdwebProvider>
    </QueryClientProvider>
  );
}