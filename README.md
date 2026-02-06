# 🛠️ Local Service Provider - Project Demo
> **Connecting neighborhoods with trusted professionals.**


### 🌐 Quick Preview
If the official website link is not yet active, click the link below to see the live view of our project:

👉 [**CLICK HERE TO SEE LIVE DEMO**](https://htmlpreview.github.io/?https://github.com/susanrayamajhi/LocalServiceFinder/blob/main/index.html)

---




<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local Service Provider | Overview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .primary-gradient {
            background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
        }
        .text-gradient {
            background: linear-gradient(to right, #2563eb, #0ea5e9);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .animate-pulse-slow {
            animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
    </style>
</head>
<body class="bg-slate-50 text-slate-900">

    <nav class="p-6 max-w-7xl mx-auto flex justify-between items-center">
        <div class="text-2xl font-black tracking-tight text-blue-600 uppercase">
            Local Service <span class="text-slate-400">Provider</span>
        </div>
    </nav>

    <header class="max-w-7xl mx-auto px-6 py-12 md:py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
            <h1 class="text-5xl md:text-6xl font-extrabold leading-tight mb-6 text-gradient">
                Expert Help, <br> Just a Click Away.
            </h1>
            <p class="text-lg text-slate-600 mb-8 leading-relaxed">
                Our platform connects homeowners with verified local professionals. 
                Fast, secure, and reliable service at your doorstep.
            </p>
        </div>

        <div class="relative">
            <div class="absolute -top-6 -left-6 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div class="relative bg-white p-2 rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <img src="https://miro.medium.com/v2/resize:fit:640/format:webp/1*BQ9l-cT7CYYFwzDRBMdJMQ.gif" 
                     alt="Local Service App Demo" 
                     class="rounded-2xl w-full h-auto">
            </div>
        </div>
    </header>

    <section class="bg-slate-100 py-16 border-y border-slate-200">
        <div class="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            
            <div class="order-2 md:order-1">
                <div class="relative bg-white p-4 rounded-xl shadow-lg border border-slate-200">
                    <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHRreXp6dzB6NXE0eXp6dzB6NXE0eXp6dzB6NXE0eXp6dzB6JmVwPXYxX2ludGVybmFsX2dpZl9ieV9iJmN0PWc/3o7TKMGpxxLSWMTu5W/giphy.gif" 
                         alt="Development in progress" 
                         class="rounded-lg w-full h-auto">
                    <div class="absolute top-6 right-6 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold animate-bounce">
                        DEVELOPING...
                    </div>
                </div>
            </div>

            <div class="order-1 md:order-2">
                <h2 class="text-3xl font-bold mb-4 text-slate-800">Current Progress</h2>
                <p class="text-slate-600 mb-6">We are currently building the <strong>Service Provider Dashboard</strong>. This will allow local experts to track their earnings and manage client requests in real-time.</p>
                <ul class="space-y-3">
                    <li class="flex items-center text-slate-700">
                        <span class="text-green-500 mr-2">✔</span> Users (In progress)
                    </li>
                    <li class="flex items-center text-slate-700">
                        <span class="text-blue-500 mr-2">⏳</span> Provider Database (In Progress)
                    </li>
                    <li class="flex items-center text-slate-700">
                        <span class="text-slate-400 mr-2">○</span> Services List (In Progress)
                    </li>
                </ul>
            </div>

        </div>
    </section>

    <footer class="py-12 text-center">
        <p class="text-slate-400 text-sm">© 2026 Team Debuggers | Local Service Provider</p>
    </footer>

</body>
</html>







