import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { AtSign, KeyRound, ArrowRight } from 'lucide-react';

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>
          
          <form className="space-y-6">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <AtSign className="h-4 w-4" />
                </div>
                <Input 
                  name="email" 
                  id="email"
                  type="email"
                  placeholder="you@example.com" 
                  required 
                  className="pl-10 bg-background/50 focus:bg-background transition-colors"
                />
              </div>
            </div>
            
            {/* Password field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Link
                  className="text-xs text-primary hover:text-primary/80 hover:underline transition-colors"
                  href="/forgot-password"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                  <KeyRound className="h-4 w-4" />
                </div>
                <Input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="••••••••"
                  required
                  className="pl-10 bg-background/50 focus:bg-background transition-colors"
                />
              </div>
            </div>
            
            {/* Submit button */}
            <SubmitButton 
              pendingText="Signing in..." 
              formAction={signInAction}
              className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center group"
            >
              <span>Sign in</span>
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </SubmitButton>
            
            {/* Form message */}
            <FormMessage message={searchParams} />
            
            {/* Sign up link */}
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link 
                  className="text-primary font-medium hover:underline" 
                  href="/sign-up"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}