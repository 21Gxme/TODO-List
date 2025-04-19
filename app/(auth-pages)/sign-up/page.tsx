import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import { AtSign, KeyRound, UserPlus } from 'lucide-react';

export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  
  if ("message" in searchParams) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-card border rounded-xl shadow-lg">
        <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 -mt-8 -mx-8 mb-8 rounded-t-xl"></div>
        <FormMessage message={searchParams} />
        <div className="mt-6 text-center">
          <Link 
            className="text-primary font-medium hover:underline inline-flex items-center" 
            href="/sign-in"
          >
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <div className="bg-card border rounded-xl shadow-lg overflow-hidden">
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight mb-2">Create an account</h1>
              <p className="text-sm text-muted-foreground">
                Join us to start organizing your tasks
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
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <Input
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Create a password (min. 6 characters)"
                    minLength={6}
                    required
                    className="pl-10 bg-background/50 focus:bg-background transition-colors"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 6 characters long
                </p>
              </div>
              
              {/* Submit button */}
              <SubmitButton 
                pendingText="Creating account..." 
                formAction={signUpAction}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center group"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Create account</span>
              </SubmitButton>
              
              {/* Form message */}
              <FormMessage message={searchParams} />
              
              {/* Sign in link */}
              <div className="text-center pt-2">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    className="text-primary font-medium hover:underline" 
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* SMTP Message component */}
      <div className="mt-8">
        <SmtpMessage />
      </div>
    </>
  );
}