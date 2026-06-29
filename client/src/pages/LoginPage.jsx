<!DOCTYPE html>

<html class="dark" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Onboarding - SkillGap Analyzer</title>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@500;700&amp;family=Plus+Jakarta+Sans:wght@600;700;800&amp;display=swap" rel="stylesheet"/>

<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

<script id="tailwind-config">
        {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "surface-bright": "#323949",
                      "surface-container-highest": "#2e3545",
                      "on-primary-container": "#f5f0ff",
                      "primary-fixed-dim": "#c7bfff",
                      "tertiary": "#38dfab",
                      "on-error": "#690005",
                      "inverse-on-surface": "#293040",
                      "primary-fixed": "#e5deff",
                      "tertiary-fixed-dim": "#38dfab",
                      "on-tertiary-fixed": "#002116",
                      "primary-container": "#6c5dd3",
                      "surface-variant": "#2e3545",
                      "on-primary-fixed-variant": "#4331a8",
                      "surface": "#0c1322",
                      "inverse-primary": "#5b4cc1",
                      "surface-container-low": "#141b2b",
                      "primary": "#c7bfff",
                      "on-surface": "#dce2f7",
                      "on-primary-fixed": "#180065",
                      "on-tertiary-fixed-variant": "#00513b",
                      "on-secondary-container": "#bea8ff",
                      "surface-container-high": "#232a3a",
                      "surface-container": "#191f2f",
                      "surface-tint": "#c7bfff",
                      "tertiary-container": "#007e5d",
                      "on-error-container": "#ffdad6",
                      "tertiary-fixed": "#5ffcc6",
                      "inverse-surface": "#dce2f7",
                      "on-tertiary-container": "#c6ffe4",
                      "on-secondary": "#381385",
                      "error": "#ffb4ab",
                      "secondary-container": "#4f319c",
                      "outline-variant": "#474553",
                      "surface-container-lowest": "#070e1d",
                      "secondary-fixed-dim": "#cebdff",
                      "on-background": "#dce2f7",
                      "secondary-fixed": "#e8ddff",
                      "on-secondary-fixed-variant": "#4f319c",
                      "on-primary": "#2c1092",
                      "error-container": "#93000a",
                      "surface-dim": "#0c1322",
                      "outline": "#928f9e",
                      "on-secondary-fixed": "#21005e",
                      "on-tertiary": "#003828",
                      "background": "#0c1322",
                      "secondary": "#cebdff",
                      "on-surface-variant": "#c9c4d5"
              },
              "borderRadius": {
                      "DEFAULT": "0.25rem",
                      "lg": "0.5rem",
                      "xl": "0.75rem",
                      "full": "9999px"
              },
              "spacing": {
                      "margin-desktop": "48px",
                      "gutter": "24px",
                      "base-unit": "4px",
                      "max-width": "1440px",
                      "margin-mobile": "16px"
              },
              "fontFamily": {
                      "body-md": ["Inter"],
                      "label-caps": ["JetBrains Mono"],
                      "headline-md": ["Plus Jakarta Sans"],
                      "display-lg-mobile": ["Plus Jakarta Sans"],
                      "display-lg": ["Plus Jakarta Sans"],
                      "data-mono": ["JetBrains Mono"],
                      "body-lg": ["Inter"]
              },
              "fontSize": {
                      "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                      "label-caps": ["12px", {"lineHeight": "16px", "fontWeight": "700"}],
                      "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                      "display-lg-mobile": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "data-mono": ["14px", {"lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "500"}],
                      "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}]
              }
            }
          }
        }
    </script>
<style>
        .glass-card {
            background: rgba(35, 42, 58, 0.4);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(108, 93, 211, 0.15);
        }
        
        .input-glow:focus {
            box-shadow: inset 0 0 0 1px #6c5dd3, 0 0 15px rgba(108, 93, 211, 0.3);
            border-color: transparent;
        }

        .btn-primary-glow {
            box-shadow: 0 4px 15px rgba(108, 93, 211, 0.4);
            transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .btn-primary-glow:hover {
            box-shadow: 0 8px 25px rgba(108, 93, 211, 0.6);
            transform: translateY(-2px);
        }
        
        .btn-primary-glow:active {
            transform: translateY(2px);
            box-shadow: 0 2px 10px rgba(108, 93, 211, 0.3);
        }
        
        select option {
            background-color: #191f2f;
            color: #dce2f7;
        }
    </style>
<script>
        function goToStep(step) {
            document.querySelectorAll('.step-pane').forEach(pane => pane.classList.add('hidden'));
            document.getElementById('step-' + step).classList.remove('hidden');
        }
    </script>
</head>
<body class="bg-[#0B0F18] text-on-surface antialiased min-h-screen relative overflow-hidden flex flex-col selection:bg-primary-container selection:text-white">

<div class="absolute inset-0 z-0 pointer-events-none">
<div class="absolute inset-0 bg-gradient-to-b from-[#0B0F18] to-background"></div>

<div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
<div class="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-tertiary-container rounded-full mix-blend-screen filter blur-[120px] opacity-10"></div>
</div>

<main class="flex-grow flex items-center justify-center relative z-10 px-margin-mobile md:px-margin-desktop py-12">

<div class="glass-card w-full max-w-md rounded-2xl p-8 relative overflow-hidden flex flex-col gap-8">

<div class="text-center space-y-2 flex flex-col items-center">
<div class="w-16 h-16 bg-primary-container/20 rounded-2xl flex items-center justify-center mb-2 border border-primary/20">
<span class="material-symbols-outlined text-primary text-4xl">bolt</span>
</div>
<h1 class="font-display-lg-mobile md:font-display-lg text-[32px] md:text-[40px] text-primary tracking-tighter leading-tight">
                    SkillGap Analyzer
                </h1>
<p class="font-body-md text-body-md text-on-surface-variant">
                    Initialize your profile to map your potential.
                </p>
</div>
<form class="space-y-6" onsubmit="event.preventDefault();">

<div class="step-pane space-y-6" id="step-1">
<div class="flex gap-2 mb-4">
<div class="h-1 flex-1 bg-primary rounded-full"></div>
<div class="h-1 flex-1 bg-surface-container-highest rounded-full"></div>
<div class="h-1 flex-1 bg-surface-container-highest rounded-full"></div>
</div>
<div class="space-y-4">
<div class="space-y-2 relative">
<label class="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-widest" for="name">
                                Full Name
                            </label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">person</span>
<input class="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none input-glow transition-all" id="name" placeholder="Jane Doe" type="text"/>
</div>
</div>
<div class="space-y-2 relative">
<label class="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-widest" for="course">
                                Course / Program
                            </label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">school</span>
<select class="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-12 pr-10 font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all appearance-none" id="course">
<option disabled="" selected="" value="">Select your current course</option>
<option value="cs">Computer Science</option>
<option value="se">Software Engineering</option>
<option value="ds">Data Science</option>
<option value="uiux">UX/UI Design</option>
</select>
<span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">expand_more</span>
</div>
</div>
<div class="space-y-2 relative">
<label class="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-widest" for="role">
                                Target Role
                            </label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">work</span>
<select class="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-12 pr-10 font-body-md text-body-md text-on-surface focus:outline-none input-glow transition-all appearance-none" id="role">
<option disabled="" selected="" value="">Select your target role</option>
<option value="frontend">Frontend Developer</option>
<option value="backend">Backend Developer</option>
<option value="fullstack">Fullstack Engineer</option>
<option value="designer">Product Designer</option>
</select>
<span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-[20px] pointer-events-none">expand_more</span>
</div>
</div>
</div>
<button class="w-full bg-primary-container text-white font-headline-md text-headline-md py-3 px-6 rounded-lg btn-primary-glow flex justify-center items-center gap-2 group" onclick="goToStep(2)" type="button">
<span>Continue</span>
<span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
</button>
</div>

<div class="step-pane space-y-6 hidden" id="step-2">
<div class="flex gap-2 mb-4">
<div class="h-1 flex-1 bg-primary rounded-full"></div>
<div class="h-1 flex-1 bg-primary rounded-full"></div>
<div class="h-1 flex-1 bg-surface-container-highest rounded-full"></div>
</div>
<div class="space-y-4">
<div class="space-y-2 relative">
<label class="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-widest" for="email">
                                Secure Communication Channel (Email)
                            </label>
<div class="relative">
<span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
<input class="w-full bg-surface-container border border-outline-variant rounded-lg py-3 pl-12 pr-4 font-body-md text-body-md text-on-surface placeholder-outline focus:outline-none input-glow transition-all" id="email" placeholder="user@domain.com" type="email"/>
</div>
<p class="text-xs text-on-surface-variant mt-2 font-body-md">We'll send a magic link to securely authenticate your session.</p>
</div>
</div>
<div class="flex flex-col gap-3">
<button class="w-full bg-primary-container text-white font-headline-md text-headline-md py-3 px-6 rounded-lg btn-primary-glow flex justify-center items-center gap-2 group" onclick="goToStep(3)" type="button">
<span class="material-symbols-outlined">magic_button</span>
<span>Send Magic Link</span>
</button>
<button class="w-full bg-surface-container-highest hover:bg-surface-variant text-on-surface font-headline-md text-headline-md py-3 px-6 rounded-lg transition-colors flex justify-center items-center" onclick="goToStep(1)" type="button">
<span>Back</span>
</button>
</div>
</div>

<div class="step-pane space-y-6 hidden" id="step-3">
<div class="flex gap-2 mb-4">
<div class="h-1 flex-1 bg-primary rounded-full"></div>
<div class="h-1 flex-1 bg-primary rounded-full"></div>
<div class="h-1 flex-1 bg-tertiary rounded-full shadow-[0_0_10px_rgba(56,223,171,0.5)]"></div>
</div>
<div class="py-8 flex flex-col items-center justify-center text-center space-y-4">
<div class="w-20 h-20 bg-tertiary/10 rounded-full flex items-center justify-center border border-tertiary/20">
<span class="material-symbols-outlined text-tertiary text-5xl">mark_email_read</span>
</div>
<h2 class="text-2xl font-display-lg text-on-surface">Transmission Sent</h2>
<p class="text-on-surface-variant font-body-md">
                            A secure magic link has been dispatched to your email. Click the link to complete authentication and access your dashboard.
                        </p>
</div>
<button class="w-full bg-surface-container-highest hover:bg-surface-variant text-on-surface font-headline-md text-headline-md py-3 px-6 rounded-lg transition-colors flex justify-center items-center gap-2" onclick="goToStep(1)" type="button">
<span class="material-symbols-outlined">restart_alt</span>
<span>Start Over</span>
</button>
</div>
</form>
</div>
</main>

<footer class="fixed bottom-0 w-full z-40 flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-6 opacity-60 bg-transparent text-tertiary font-label-caps text-label-caps">
<div class="text-on-surface font-bold opacity-80 hover:opacity-100 transition-colors">
            © 2024 SkillGap Analyzer. Secure Terminal Access.
        </div>
<div class="flex gap-6 mt-4 md:mt-0">
<a class="text-outline hover:text-tertiary-fixed transition-colors" href="#">Privacy Policy</a>
<a class="text-outline hover:text-tertiary-fixed transition-colors" href="#">Terms of Service</a>
<a class="text-outline hover:text-tertiary-fixed transition-colors" href="#">System Status</a>
</div>
</footer>
</body></html>