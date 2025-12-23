import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function AIAssistant() {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring" }}
      className="fixed bottom-6 right-6 z-50"
    >
      <Link to="/stylist">
        <Button className="h-14 w-14 rounded-full shadow-elevated" size="icon">
          <MessageCircle className="w-5 h-5" />
        </Button>
      </Link>
    </motion.div>
  );
}
