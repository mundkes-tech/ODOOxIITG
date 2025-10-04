import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Mail, Lock, User, Building2, Globe, ArrowRight, Sparkles, TrendingUp, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string || "employee";

    try {
      if (isLogin) {
        // Login
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        
        const user = await login(email, password);
        
        toast({
          title: "Welcome back! 👋",
          description: "Redirecting to your dashboard...",
        });
        
        setTimeout(() => {
          navigate(`/${user.role}`);
        }, 1000);
      } else {
        // Signup
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const companyName = formData.get("company") as string;
        const country = formData.get("country") as string;
        
        // Map country to currency
        const countryToCurrency: { [key: string]: string } = {
          'us': 'USD',
          'uk': 'GBP', 
          'eu': 'EUR',
          'in': 'INR',
          'au': 'AUD',
          'ca': 'CAD',
          'jp': 'JPY',
          'sg': 'SGD'
        };
        
        const currency = countryToCurrency[country] || 'USD';
        
        await signup({
          name,
          email,
          password,
          companyName,
          country,
          currency,
        });
        
        toast({
          title: "Account created! 🎉",
          description: "Your company & admin account are ready!",
        });
        
        setTimeout(() => {
          navigate("/admin");
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const floatingElements = [
    { icon: Sparkles, delay: 0, duration: 6 },
    { icon: TrendingUp, delay: 1, duration: 7 },
    { icon: Shield, delay: 2, duration: 8 },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-20" />
      
      {/* Floating Particles */}
      {floatingElements.map((Element, i) => (
        <motion.div
          key={i}
          className="absolute text-primary/20"
          initial={{ x: Math.random() * window.innerWidth, y: window.innerHeight + 100 }}
          animate={{
            y: -100,
            x: Math.random() * window.innerWidth,
            rotate: 360,
          }}
          transition={{
            duration: Element.duration,
            delay: Element.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Element.icon size={24} />
        </motion.div>
      ))}

      {/* Gradient Orbs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-primary/30 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.5, 0.3, 0.5],
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Section - Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block space-y-6"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-hero rounded-3xl rotate-12 flex items-center justify-center shadow-elevated">
                <Building2 className="w-16 h-16 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="text-4xl lg:text-5xl font-bold gradient-text text-center"
            >
              Smart, Fast & Transparent
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="text-xl text-muted-foreground text-center"
            >
              Expense Management 💼
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="flex justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI-Powered OCR</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Real-time Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Secure & Compliant</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Section - Auth Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="glass-card p-8 backdrop-blur-xl">
              <div className="space-y-6">
                {/* Toggle Buttons */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 rounded-md transition-all ${
                      isLogin
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 rounded-md transition-all ${
                      !isLogin
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form Content */}
                <AnimatePresence mode="wait">
                  <motion.form
                    key={isLogin ? "login" : "signup"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="space-y-4"
                  >
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="name" className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          required
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                      </motion.div>
                    )}

                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="company" className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-primary" />
                          Company Name
                        </Label>
                        <Input
                          id="company"
                          name="company"
                          placeholder="Acme Corp"
                          required
                          className="transition-all focus:ring-2 focus:ring-primary"
                        />
                      </motion.div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="you@company.com"
                        required
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-primary" />
                        Password
                      </Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="transition-all focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="country" className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-primary" />
                          Country & Currency
                        </Label>
                        <Select name="country" defaultValue="us">
                          <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us">United States (USD)</SelectItem>
                            <SelectItem value="uk">United Kingdom (GBP)</SelectItem>
                            <SelectItem value="eu">European Union (EUR)</SelectItem>
                            <SelectItem value="in">India (INR)</SelectItem>
                            <SelectItem value="au">Australia (AUD)</SelectItem>
                            <SelectItem value="ca">Canada (CAD)</SelectItem>
                            <SelectItem value="jp">Japan (JPY)</SelectItem>
                            <SelectItem value="sg">Singapore (SGD)</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}


                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full group relative overflow-hidden"
                      size="lg"
                    >
                      <motion.span
                        className="flex items-center justify-center gap-2"
                        animate={isLoading ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
                      >
                        {isLoading ? (
                          "Processing..."
                        ) : isLogin ? (
                          <>
                            Sign In
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        ) : (
                          <>
                            Create My Company 🚀
                          </>
                        )}
                      </motion.span>
                    </Button>

                    {isLogin && (
                      <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" className="rounded" />
                          <span className="text-muted-foreground">Remember me</span>
                        </label>
                        <a href="#" className="text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                    )}
                  </motion.form>
                </AnimatePresence>

                <div className="text-center text-sm text-muted-foreground">
                  {isLogin ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => setIsLogin(false)}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => setIsLogin(true)}
                        className="text-primary hover:underline font-medium"
                      >
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
