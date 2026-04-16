"use client";


import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginUser } from "@/service/auth/loginUser";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

const LoginForm = ({ redirect }: { redirect?: string }) => {
  const [state, formAction, isPending] = useActionState(loginUser, null);

  // Local state for auto-filling credentials
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  // Handler for auto-fill buttons
  const handleAutoFill = (role: "teacher" | "cr" | "student" | "admin") => {
    switch (role) {
      case "teacher":
        setFormData({ email: "hasan.teacher@example.com", password: "TeacherPass123" });
        break;
      case "cr":
        setFormData({ email: "cr5.student@example.com", password: "CrPass123" });
        break;
      case "student":
        setFormData({ email: "rahim.student22@example.com", password: "StudentPass123" });
        break;
      case "admin":
        setFormData({ email: "jabed1780@gmail.com", password: "jabed1780" });
        break;
    }
  };

  return (
    <form action={formAction}>
      {redirect && <input type="hidden" name="redirect" value={redirect} />}
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4">
          {/* Email */}
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <InputFieldError field="email" state={state} />
          </Field>

          {/* Password */}
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <InputFieldError field="password" state={state} />
          </Field>
        </div>

        {/* Auto-fill Buttons */}
        <div className="flex gap-2 mt-2">
          <Button type="button" onClick={() => handleAutoFill("teacher")}>
            Teacher
          </Button>
          <Button type="button" onClick={() => handleAutoFill("cr")}>
            CR
          </Button>
          <Button type="button" onClick={() => handleAutoFill("student")}>
            Student
          </Button>
          <Button type="button" onClick={() => handleAutoFill("admin")}>
            Admin
          </Button>
        </div>

        <FieldGroup className="mt-4">
          <Field>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Logging in..." : "Login"}
            </Button>

            <FieldDescription className="px-6 text-center">
              Don&apos;t have an account?{" "}
              <a href="/register" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </FieldDescription>
            <FieldDescription className="px-6 text-center">
              <a
                href="/forget-password"
                className="text-blue-600 hover:underline"
              >
                Forgot password?
              </a>

         
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </form>
  );
};

export default LoginForm;