extends layout

block content
    section.hero
        div.floating-icons#hero-floating-icons
        div.container
            h1 Find & Book Local Services with Ease
            p The best professionals in your area, just a few clicks away.
            form.search-form
                input(type="text", placeholder="What service are you looking for? (e.g., plumber, electrician)")
                button(type="submit") Search

    section.service-categories
        div.container
            h2.section-title Explore Categories
            div.categories-container
                if categories && categories.length > 0
                    each cat in categories
                        div.category
                            - var icon = cat.image || `https://img.icons8.com/fluency/80/000000/${cat.name.toLowerCase().replace(' ', '-')}.png`
                            a(href=`/category/${cat.id}`, style="text-decoration: none; color: inherit;")
                                img(src=icon, alt=cat.name)
                                h3= cat.name
                                p(style="font-size: 0.85rem; color: #666; margin-top: 0.5rem; line-height: 1.2;")= cat.description
                else
                    p No categories available at the moment.

    section.how-it-works
        div.container
            h2.section-title How It Works
            div.steps-container
                div.step
                    div.step-number 1
                    h3 Search for a Service
                    p Tell us what you need. We'll show you a list of qualified professionals.
                div.step
                    div.step-number 2
                    h3 Choose Your Pro
                    p Compare profiles, read reviews, and select the best partner for your job.
                div.step
                    div.step-number 3
                    h3 Book & Relax
                    p Book a convenient time, pay securely, and let our pros handle the rest.

    section.testimonials
        div.container
            h2.section-title What Our Clients Say
            div.testimonials-container
                div.testimonial
                    img(src="https://randomuser.me/api/portraits/women/44.jpg", alt="Client 1")
                    p "Finding a reliable plumber has never been easier. Local Service Provider connected me with a professional in minutes!"
                    div.author - Sarah J.
                div.testimonial
                    img(src="https://randomuser.me/api/portraits/men/32.jpg", alt="Client 2")
                    p "The mechanic I found was fantastic. Fair pricing and excellent work. I highly recommend this platform."
                    div.author - Michael B.
                div.testimonial
                    img(src="https://randomuser.me/api/portraits/women/57.jpg", alt="Client 3")
                    p "I needed an electrician urgently, and Local Service Provider delivered. The booking process was simple and fast."
                    div.author - Emily R.
