
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

interface PaymentStepperProps {
  currentStep: number; // 0-3
}

const steps = ['Invoice', 'Wallet', 'Quote', 'Confirm'];

export default function PaymentStepper({ currentStep }: PaymentStepperProps) {
  return (
    <div className="flex items-center justify-between px-2 py-3">
      {steps.map((step, index) => (
        <div key={step} className="flex-1 flex flex-col items-center">
          <div className="flex items-center w-full">
            <div className={cn('h-0.5 flex-1', index === 0 ? 'bg-transparent' : index <= currentStep ? 'bg-protocol-ton' : 'bg-white/10')} />
            <motion.div
              className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2', index <= currentStep ? 'bg-protocol-violet border-protocol-violet text-white' : 'bg-white/10 border-white/20 text-white/40')}
              animate={{ scale: index === currentStep ? 1.1 : 1 }}
            >
              {index < currentStep ? '✓' : index + 1}
            </motion.div>
            {index < steps.length - 1 && (
              <div className={cn('h-0.5 flex-1', index < currentStep ? 'bg-protocol-ton' : 'bg-white/10')} />
            )}
          </div>
          <span className={cn('mt-1 text-[9px] font-mono', index === currentStep ? 'text-protocol-ton' : 'text-white/40')}>{step}</span>
        </div>
      ))}
    </div>
  );
}
