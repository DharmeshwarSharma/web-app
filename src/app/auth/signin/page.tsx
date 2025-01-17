"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Hospital, Lock, AlertCircle, ArrowLeft, Check, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import LoadingComponents from "@/components/LoadingComponents";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Component() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [step, setStep] = useState("signin"); // 'signin', 'otp', 'mfa', or 'confirmation'
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  useEffect(() => {
    if (step === "otp") {
      otpRefs.current[0]?.focus();
    }
  }, [step]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = value;
      setOtpValues(newOtpValues);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (step === "signin") {
      if (!email || !password) {
        setError("Please fill in all fields.");
        return;
      }

      if (!email.includes("@") || !email.includes(".")) {
        setError("Please enter a valid email address.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }

      setStep("otp");
    } else if (step === "otp") {
      const otp = otpValues.join("");
      if (otp.length !== 6) {
        setError("Please enter a valid 6-digit OTP.");
        return;
      }

      if (otp === "123456") {
        console.log(email, password);
        setLoading(true);
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        setLoading(false);
        console.log(res);
        if (res?.error) {
          setStep("error");
        } else if (res?.ok) {
          setStep("confirmation");
        }
      } else {
        toast({
          title: "Invalid OTP",
          description: "Kindly enter the correct OTP or try again later",
          variant: "destructive",
        });
      }
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes("@") || !resetEmail.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    // Simulate password reset email send
    alert(`Password reset link sent to ${resetEmail}`);
    setIsDialogOpen(false);
    setResetEmail("");
  };
  const renderError = () => (
    <motion.div
      className="flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="rounded-full bg-red-700 p-2 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
      >
        <X className="h-10 w-10 text-white" />
      </motion.div>
      <motion.h2
        className="text-2xl font-bold text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Login Failed
      </motion.h2>
      <motion.p
        className="text-center text-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          variant="outline"
          onClick={() => {
            redirect("/auth/signin");
          }}
          className="text-white"
        >
          Retry?
        </Button>
      </motion.p>
    </motion.div>
  );
  const renderConfirmation = () => (
    <motion.div
      className="flex flex-col items-center justify-center h-full"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="rounded-full bg-green-500 p-2 mb-4"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 500, damping: 30 }}
      >
        <Check className="h-10 w-10 text-white" />
      </motion.div>
      <motion.h2
        className="text-2xl font-bold text-center mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Login Successful
      </motion.h2>
      <motion.p
        className="text-center text-gray-600"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        Redirecting to dashboard...
      </motion.p>
    </motion.div>
  );
 useEffect(() => {
   if (step === "confirmation") {
     const timer = setTimeout(() => {
       router.push("/dashboard");
     }, 1000);

     return () => clearTimeout(timer);
   }
 }, [step, router]);


  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Hospital className="h-12 w-12 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              Hospital Sign In
            </CardTitle>
            <CardDescription className="flex justify-center space-x-4">
              Don&apos;t have an account?{" "}
              <Link className="hover:underline" href={"/auth/signup"}>
                Signup
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "confirmation" ? (
              renderConfirmation()
            ) : step === "error" ? (
              renderError()
            ) : (
              <>
                <form onSubmit={handleSubmit}>
                  {step === "signin" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">Hospital Email</Label>
                        <Input
                          id="email"
                          placeholder="hospital@example.com"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="flex items-center space-x-2 mt-4">
                        <Checkbox id="remember" />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Remember me
                        </label>
                      </div>
                    </>
                  )}
                  {step === "otp" && (
                    <div className="space-y-2">
                      <Label htmlFor="otp">
                        {step === "otp" ? "Enter OTP" : null}
                      </Label>
                      <div className="flex justify-between">
                        {otpValues.map((value, index) => (
                          <Input
                            key={index}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            className="w-12 h-12 text-center text-lg"
                            value={value}
                            onChange={(e) =>
                              handleOtpChange(index, e.target.value)
                            }
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            ref={(el) => {
                              otpRefs.current[index] =
                                el as HTMLInputElement | null;
                            }}
                            required
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    className="w-full mt-4"
                    type="submit"
                    onClick={handleSubmit}
                  >
                    {step === "signin" ? (
                      "Sign In"
                    ) : step === "otp" ? (
                      loading === false ? (
                        "Verify OTP"
                      ) : (
                        <LoadingComponents />
                      )
                    ) : null}
                  </Button>
                </form>
                {step !== "signin" && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setStep("signin");
                      setOtpValues(["", "", "", "", "", ""]);
                    }}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Sign In
                  </Button>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="flex items-center justify-center w-full">
              {step === "signin" ? (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="link"
                      className="text-sm text-red-600 hover:underline"
                    >
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Reset Password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we&apos;ll send you a link
                        to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword}>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="reset-email" className="text-right">
                            Email
                          </Label>
                          <Input
                            id="reset-email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Send Reset Link</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : null}
            </div>
            <div className="flex items-center justify-center w-full">
              <Lock className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm text-gray-500">Secure Sign-In</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
