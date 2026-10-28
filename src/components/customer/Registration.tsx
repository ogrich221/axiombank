import { useState, useRef, type FormEvent } from 'react';
import { Link } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Camera, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/site/Logo';
import { Field, PasswordField, WebsiteBack } from './CustomerControls';
import { residenceCountries, registrationSchema } from '@/lib/customer-schemas';
import { registerCustomer } from '@/lib/customer.functions';

const initial = {
  first_name: '',
  middle_name: '',
  last_name: '',
  display_name: '',
  date_of_birth: '',
  nationality: '',
  country: '',
  address: '',
  city: '',
  region: '',
  postal_code: '',
  email: '',
  phone: '',
  photo: '',
  password: '',
  confirm_password: '',
  transfer_pin: '',
  confirm_transfer_pin: '',
  terms: false,
};

const steps = [
  'Personal details',
  'Contact information',
  'Identity verification',
  'Account security',
  'Review & submit',
];

export function Registration() {
  const [values, setValues] = useState(initial);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const register = useServerFn(registerCustomer);

  function update(key: keyof typeof initial, value: string | boolean) {
    setValues((old) => ({ ...old, [key]: value }));
  }

  const field = (key: keyof typeof initial, label: string, type = 'text', required = true) => (
    <Field
      key={key}
      label={label}
      name={key}
      value={String(values[key])}
      type={type}
      required={required}
      maxLength={key === 'address' ? 250 : 80}
      error={errors[key]}
      onChange={(event) => update(key, event.target.value)}
    />
  );

  async function choosePhoto(file?: File) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, photo: 'Choose a JPG, PNG or WebP image under 10 MB.' }));
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const size = 512;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const side = Math.min(bitmap.width, bitmap.height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        update('photo', dataUrl);
        setErrors((e) => {
          const { photo: _p, ...rest } = e;
          return rest;
        });
      }
    } catch {
      setErrors((prev) => ({ ...prev, photo: 'This image could not be read. Try another photo.' }));
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = registrationSchema.safeParse(values);
    const currentKeys =
      step === 0
        ? ['first_name', 'last_name', 'date_of_birth', 'nationality', 'country', 'address', 'city']
        : step === 1
        ? ['email', 'phone']
        : step === 3
        ? ['password', 'confirm_password', 'transfer_pin', 'confirm_transfer_pin']
        : [];
    const next: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (step === 4 || currentKeys.includes(key)) next[key] = issue.message;
      }
    }
    if ((step === 2 || step === 4) && !values.photo) {
      next['photo'] = 'Please upload a profile photo to continue with identity verification.';
    }
    setErrors(next);
    if (Object.keys(next).length) return;
    if (step < 4) {
      setStep(step + 1);
      return;
    }
    if (!parsed.success) return;
    setBusy(true);
    try {
      await register({
        data: {
          ...parsed.data,
          photo: values.photo || undefined,
        },
      });
      setDone(true);
      setValues((old) => ({
        ...old,
        password: '',
        confirm_password: '',
        transfer_pin: '',
        confirm_transfer_pin: '',
      }));
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="customer-theme min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-5">
          <Logo />
          <Button asChild variant="ghost">
            <Link to="/login">
              Sign in
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <WebsiteBack />
        {done ? (
          <div className="mx-auto max-w-xl py-20 text-center">
            <ShieldCheck className="mx-auto size-12 text-primary" />
            <h1 className="mt-6 text-3xl font-bold">Check your email</h1>
            <p className="mt-4 text-muted-foreground">
              Confirm your email using the link we sent, then sign in to access your account dashboard and view your application status.
            </p>
            <Button className="mt-8" asChild>
              <Link to="/login">Go to sign in</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-7 grid gap-12 lg:grid-cols-[260px_1fr]">
            <aside>
              <p className="text-xs font-semibold uppercase text-primary">Your next chapter</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight">Open Your AXIOM Account</h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                A clearer way to manage your money starts here. Let's get to know you.
              </p>
              <ol className="mt-8 space-y-5" aria-label="Registration progress">
                {steps.map((title, index) => (
                  <li
                    key={title}
                    className={`flex items-center gap-3 text-sm ${index === step ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
                    aria-current={index === step ? 'step' : undefined}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border">
                      {index < step ? <Check className="size-4" /> : index + 1}
                    </span>
                    {title}
                  </li>
                ))}
              </ol>
            </aside>
            <section className="min-w-0 border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-12">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold">{steps[step]}</h2>
                <span className="text-sm text-muted-foreground">{step + 1} / 5</span>
              </div>
              <form onSubmit={submit} noValidate className="space-y-6">
                {step === 0 && (
                  <div className="grid gap-5 sm:grid-cols-2">
                    {field('first_name', 'First name')}
                    {field('middle_name', 'Middle name (optional)', 'text', false)}
                    {field('last_name', 'Last name')}
                    {field('display_name', 'Preferred name (optional)', 'text', false)}
                    {field('date_of_birth', 'Date of birth', 'date')}
                    {field('nationality', 'Nationality')}
                    <label className="text-sm font-medium">
                      Country of residence
                      <input
                        className="customer-field mt-2"
                        list="residences"
                        value={values.country}
                        onChange={(e) => update('country', e.target.value)}
                        placeholder="Search eligible countries"
                      />
                      <datalist id="residences">
                        {residenceCountries.map((country) => (
                          <option key={country} value={country} />
                        ))}
                      </datalist>
                      {errors['country'] && <span className="text-xs text-destructive">{errors['country']}</span>}
                    </label>
                    {field('address', 'Residential address')}
                    {field('city', 'City')}
                    {field('region', 'State or region (optional)', 'text', false)}
                    {field('postal_code', 'Postal code (where applicable)', 'text', false)}
                  </div>
                )}
                {step === 1 && (
                  <>
                    {field('email', 'Email address', 'email')}
                    {field('phone', 'Mobile phone number', 'tel')}
                    <p className="rounded-md bg-secondary p-4 text-sm leading-6">
                      We will send an email confirmation link upon submission and use your mobile phone for two-factor security alerts.
                    </p>
                  </>
                )}
                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-primary">Identity & KYC Verification</span>
                      <h3 className="mt-1 text-2xl font-bold">Upload Your Profile & Identity Photo</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        To comply with international banking compliance standards and secure your account, please upload a clear color photo of your face.
                      </p>
                    </div>

                    <input
                      type="file"
                      ref={fileInput}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = '';
                        void choosePhoto(file);
                      }}
                    />

                    {values.photo ? (
                      <div className="flex flex-col sm:flex-row items-center gap-6 rounded-xl border border-primary/30 bg-primary/5 p-6">
                        <div className="relative size-28 shrink-0 overflow-hidden rounded-full border-2 border-primary shadow-sm bg-background">
                          <img src={String(values.photo)} alt="Uploaded identity preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-sm font-semibold text-primary">
                            <Check className="size-4" />Photo attached successfully
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Your portrait will be saved to your profile and encrypted for banking compliance review.
                          </p>
                          <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                            <Button type="button" size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
                              <Upload className="mr-1.5 size-3.5" />Change photo
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:bg-destructive/10"
                              onClick={() => update('photo', '')}
                            >
                              <Trash2 className="mr-1.5 size-3.5" />Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInput.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const file = e.dataTransfer.files?.[0];
                          void choosePhoto(file);
                        }}
                        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-8 text-center hover:border-primary/50 hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
                          <Camera className="size-8" />
                        </div>
                        <h4 className="text-base font-semibold">Upload your identity photo</h4>
                        <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                          Drag and drop your file here, or click to browse. Supported formats: JPG, PNG, WebP (Max 10MB).
                        </p>
                        <Button type="button" size="sm" variant="outline" className="mt-4 pointer-events-none">
                          <Upload className="mr-1.5 size-4" />Choose Image File
                        </Button>
                      </div>
                    )}

                    {errors['photo'] && (
                      <p role="alert" className="text-sm font-medium text-destructive">
                        {errors['photo']}
                      </p>
                    )}

                    <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <ShieldCheck className="size-4 text-primary" />KYC Verification & Privacy
                      </div>
                      <p>
                        Your identity photo is safeguarded with end-to-end TLS and AES-256 encryption. It is solely used to verify your identity and protect against unauthorized account takeovers.
                      </p>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <>
                    <PasswordField
                      label="Create password"
                      value={values.password}
                      autoComplete="new-password"
                      minLength={12}
                      maxLength={128}
                      onChange={(e) => update('password', e.target.value)}
                    />
                    {errors['password'] && <p className="text-sm text-destructive">{errors['password']}</p>}
                    <PasswordField
                      label="Confirm password"
                      value={values.confirm_password}
                      autoComplete="new-password"
                      onChange={(e) => update('confirm_password', e.target.value)}
                    />
                    {errors['confirm_password'] && <p className="text-sm text-destructive">{errors['confirm_password']}</p>}
                    <p className="text-sm text-muted-foreground">
                      Use a memorable passphrase of at least 12 characters.{' '}
                      {values.password.length >= 16
                        ? 'Strong length'
                        : values.password.length >= 12
                        ? 'Minimum length met'
                        : 'Keep going'}
                    </p>
                    <div className="border-t border-border pt-5 space-y-4">
                      <div>
                        <h3 className="font-semibold text-foreground">Create 4-Digit Transfer Authorization PIN</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          This 4-digit PIN is strictly required to authorize and initiate any outgoing wire or member transfer.
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium">
                            4-Digit Transfer PIN
                            <input
                              type="password"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={4}
                              className="customer-field mt-1.5 font-mono text-center tracking-[0.3em] text-lg font-bold"
                              placeholder="••••"
                              value={values.transfer_pin}
                              onChange={(e) => update('transfer_pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                              required
                            />
                          </label>
                          {errors['transfer_pin'] && (
                            <p className="mt-1 text-xs text-destructive">{errors['transfer_pin']}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium">
                            Confirm Transfer PIN
                            <input
                              type="password"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={4}
                              className="customer-field mt-1.5 font-mono text-center tracking-[0.3em] text-lg font-bold"
                              placeholder="••••"
                              value={values.confirm_transfer_pin}
                              onChange={(e) => update('confirm_transfer_pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                              required
                            />
                          </label>
                          {errors['confirm_transfer_pin'] && (
                            <p className="mt-1 text-xs text-destructive">{errors['confirm_transfer_pin']}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {step === 4 && (
                  <>
                    {values.photo && (
                      <div className="mb-6 flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <img
                          src={String(values.photo)}
                          alt="Profile thumbnail"
                          className="size-14 rounded-full object-cover border border-primary/40"
                        />
                        <div>
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Identity Photo Attached</p>
                          <p className="text-sm font-medium">
                            {values.first_name} {values.last_name}
                          </p>
                        </div>
                      </div>
                    )}
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {[
                        ['Name', `${values.first_name} ${values.last_name}`],
                        ['Residence', `${values.address}, ${values.city}, ${values.country}`],
                        ['Email', values.email],
                        ['Phone', values.phone],
                        ['Identity Photo', values.photo ? 'Photo uploaded & attached' : 'Not provided'],
                        ['Security', 'Password configured'],
                        ['Transfer PIN', '•••• (4-digit PIN configured)'],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs text-muted-foreground">{label}</dt>
                          <dd className="mt-1 break-words text-sm font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <Button type="button" variant="outline" onClick={() => setStep(0)}>
                      Edit personal details
                    </Button>
                    <label className="flex items-start gap-3 text-sm leading-6">
                      <input
                        type="checkbox"
                        checked={values.terms}
                        onChange={(e) => update('terms', e.target.checked)}
                        className="mt-1 size-4"
                      />
                      <span>
                        I acknowledge the{' '}
                        <Link to="/privacy" className="text-primary underline">
                          Privacy Policy
                        </Link>{' '}
                        and{' '}
                        <Link to="/terms" className="text-primary underline">
                          Terms and Conditions
                        </Link>
                        .
                      </span>
                    </label>
                    {errors['terms'] && <p className="text-sm text-destructive">{errors['terms']}</p>}
                  </>
                )}
                {errors['form'] && <p role="alert" className="text-sm text-destructive">{errors['form']}</p>}
                <div className="flex justify-between border-t border-border pt-6">
                  <Button type="button" variant="ghost" disabled={step === 0 || busy} onClick={() => setStep(step - 1)}>
                    <ArrowLeft />
                    Back
                  </Button>
                  <Button disabled={busy} type="submit" className="h-11">
                    {busy ? 'Submitting…' : step === 4 ? 'Submit application' : 'Continue'}
                    <ArrowRight />
                  </Button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
