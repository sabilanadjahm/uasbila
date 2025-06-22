import { motion } from 'framer-motion';

export default function MotionElements({ children }) {
  const MotionDiv = motion.div;
  const MotionForm = motion.form;

  return children({ MotionDiv, MotionForm });
}
