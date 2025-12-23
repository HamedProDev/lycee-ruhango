import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail, Eye, EyeOff, ArrowLeft, User } from "lucide-react";
import schoolLogo from "@/assets/school-logo.png";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
});

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (isSignup) {
      const result = signupSchema.safeParse({ email, password, fullName });
      if (!result.success) {
        const fieldErrors: { email?: string; password?: string; fullName?: string } = {};
        result.error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
          if (err.path[0] === "fullName") fieldErrors.fullName = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setIsLoading(true);
      const { error } = await signUp(email, password, fullName);

      if (error) {
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Account Created!",
        description: "Your account has been created. You can now sign in.",
      });
      setIsSignup(false);
      setIsLoading(false);
    } else {
      const result = loginSchema.safeParse({ email, password });
      if (!result.success) {
        const fieldErrors: { email?: string; password?: string } = {};
        result.error.errors.forEach((err) => {
          if (err.path[0] === "email") fieldErrors.email = err.message;
          if (err.path[0] === "password") fieldErrors.password = err.message;
        });
        setErrors(fieldErrors);
        return;
      }

      setIsLoading(true);
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message === "Invalid login credentials" 
            ? "Invalid email or password. Please try again."
            : error.message,
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      navigate("/admin");
    }
  };

  return (
    <>
      <Helmet>
        <title>{isSignup ? "Admin Signup" : "Admin Login"} | Lycée de Ruhango Ikirezi TSS</title>
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-card rounded-2xl shadow-soft p-8">
            {/* Logo */}
            <div className="text-center mb-8">
              <img src={schoolLogo} alt="School Logo" className="h-20 mx-auto mb-4" />
              <h1 className="text-2xl font-bold font-poppins text-foreground">
                {isSignup ? "Create Account" : "Admin Login"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isSignup ? "Sign up to create an admin account" : "Sign in to access the admin dashboard"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignup && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@lyceeruhango.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isSignup ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  isSignup ? "Create Account" : "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setErrors({});
                }}
                className="text-sm text-primary hover:underline"
              >
                {isSignup ? "Already have an account? Sign in" : "Need an account? Sign up"}
              </button>
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>Protected area. Authorized personnel only.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
