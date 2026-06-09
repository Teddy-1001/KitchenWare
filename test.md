 <!-- <% if (cart.length===0) { %>
            <p>Your cart is empty</p>
            <% } else { %>

                <% cart.forEach(item=> { %>
                    <div class="flex gap-4 items-center border-b py-3">
                        <img src="<%= item.image_url %>" class="w-16 h-16 object-cover rounded">

                        <div>
                            <h3>
                                <%= item.name %>
                            </h3>
                            <p>KES <%= item.price %>
                            </p>
                            <p>Qty: <%= item.qty %>
                            </p>
                        </div>

                        <form action="/cart/remove" method="POST">
                            <input type="hidden" name="id" value="<%= item.id %>">
                            <button class="text-red-500">Remove</button>
                        </form>
                    </div>
                    <% }) %>

                        <h2 class="mt-5 font-bold">
                            Total: KES <%= total %>
                        </h2>

                        <% } %> -->


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/output.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/7.0.1/css/all.min.css"
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <title>
        <%= utensil.name %>
    </title>
</head>

<body class="bg-zinc-50 antialiased">

    <%- include("../partials/header.ejs") %>

        <main>

            <!-- BREADCRUMB + TITLE -->
            <section class="bg-white border-b border-zinc-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">

                    <div class="text-center max-w-2xl mx-auto">

                        <span
                            class="inline-block px-3.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-4">
                            Shop Collection
                        </span>

                        <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 tracking-tight">
                            Utensil Details
                        </h1>

                        <p class="mt-4 text-zinc-600 text-sm sm:text-base leading-relaxed">
                            Discover premium utensils designed to make cooking easier, faster, and more enjoyable.
                        </p>

                        <nav class="flex items-center justify-center gap-2 mt-5 text-sm text-zinc-500">
                            <a href="/" class="hover:text-amber-600 transition">Home</a>
                            <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400"></i>
                            <span class="text-zinc-800 font-medium capitalize">
                                <%= utensil.name %>
                            </span>
                        </nav>

                    </div>
                </div>
            </section>

            <!-- PRODUCT SECTION -->
            <section class="bg-white">
                <div class="max-w-7xl mx-auto px-4 py-12">
                    <div class="grid lg:grid-cols-2 gap-12">
                        <!-- LEFT -->
                        <div>
                            <div class="bg-zinc-100 rounded-xl overflow-hidden">
                                <img src="<%= utensil.image_url %>" class="w-full h-[500px] object-cover">
                            </div>
                            <div class="grid grid-cols-4 gap-3 mt-4">
                                <img src="<%= utensil.image_url %>"
                                    class="border rounded-lg cursor-pointer hover:border-amber-500">
                                <img src="<%= utensil.image_url %>"
                                    class="border rounded-lg cursor-pointer hover:border-amber-500">
                                <img src="<%= utensil.image_url %>"
                                    class="border rounded-lg cursor-pointer hover:border-amber-500">
                                <img src="<%= utensil.image_url %>"
                                    class="border rounded-lg cursor-pointer hover:border-amber-500">
                            </div>
                        </div>
                        <!-- RIGHT -->
                        <div>
                            <span class="text-sm text-amber-600 font-medium">
                                <%= utensil.category_name %>
                            </span>
                            <h1 class="text-4xl font-bold mt-2">
                                <%= utensil.name %>
                            </h1>
                            <!-- Rating -->
                            <div class="flex items-center gap-2 mt-3">
                                <div class="text-amber-500">
                                    ★★★★★
                                </div>
                                <span class="text-zinc-500">
                                    4.8 (20 Reviews)
                                </span>
                            </div>
                            <!-- Price -->
                            <div class="flex items-center gap-3 mt-6">
                                <span class="text-3xl font-bold">
                                    KES <%= Number(utensil.price).toLocaleString() %>
                                </span>
                                <% if(utensil.old_price){ %>
                                    <span class="line-through text-zinc-400 text-xl">
                                        KES <%= Number(utensil.old_price).toLocaleString() %>
                                    </span>
                                    <% } %>
                            </div>
                            <!-- Description -->
                            <p class="text-zinc-600 leading-7 mt-6">
                                <%= utensil.description %>
                            </p>
                            <!-- Stock -->
                            <div class="mt-6">
                                <% if(utensil.stock> 0){ %>
                                    <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                        In Stock (<%= utensil.stock %>)
                                    </span>
                                    <% } else { %>
                                        <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                            Out of Stock
                                        </span>
                                        <% } %>
                            </div>
                            <!-- Quantity -->
                            <div class="flex items-center gap-4 mt-8">
                                <div class="flex border rounded-lg overflow-hidden">
                                    <form method="post" action="/cart/decrease">
                                        <input type="hidden" name="id" value="<%= utensil.id %>" />
                                        <button type="submit" name="id" class="w-12 h-12 border-r hover:bg-zinc-100">
                                            -
                                        </button>
                                    </form>
                                    <input type="text" value="1" class="w-14 text-center outline-none">
                                    <form method="POST" action="/cart/increase">
                                        <input type="hidden" name="id" value="<%= utensil.id %>" />
                                        <button type="submit" class="w-12 h-12 border-l hover:bg-zinc-100">
                                            +
                                        </button>
                                    </form>
                                </div>
                                <button class="bg-amber-500 hover:bg-amber-600 text-white px-8 h-12 rounded-lg">
                                    Add To Cart
                                </button>
                                <button class="border border-zinc-300 hover:border-zinc-500 px-8 h-12 rounded-lg">
                                    Buy Now
                                </button>
                            </div>
                            <!-- Product Meta -->
                            <div class="border-t mt-10 pt-6 space-y-3 text-sm">
                                <p>
                                    <span class="font-semibold">SKU:</span>
                                    KW-<%= utensil.id %>
                                </p>
                                <p>
                                    <span class="font-semibold">Category:</span>
                                    <%= utensil.category_name %>
                                </p>
                                <p>
                                    <span class="font-semibold">Badge:</span>
                                    <%= utensil.badge || 'Standard' %>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="bg-white mt-8 border-t">
                <div class="max-w-7xl mx-auto px-4 py-10">
                    <div class="border-b flex gap-8">
                        <button class="pb-4 border-b-2 border-amber-500 font-semibold">
                            Description
                        </button>

                        <button class="pb-4 text-zinc-500">
                            Specifications
                        </button>

                        <button class="pb-4 text-zinc-500">
                            Reviews
                        </button>
                    </div>

                    <div class="py-8">
                        <p class="text-zinc-600 leading-8">
                            <%= utensil.description %>
                        </p>
                    </div>

                </div>
            </section>
        </main>

</body>

</html>


<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="/css/output.css">
    <!-- Font Awesome 6 (free) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <title>
        <%= utensil.name %> | Utensil Store
    </title>
    <style>
        /* Custom smooth transitions */
        .transition-smooth {
            transition: all 0.2s ease-in-out;
        }

        .tab-btn.active {
            @apply text-amber-600 border-b-2 border-amber-600;
        }

        .tab-content {
            animation: fade 0.25s ease-out;
        }

        @keyframes fade {
            from {
                opacity: 0;
                transform: translateY(8px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .size-option.active {
            @apply bg-amber-600 text-white border-amber-600;
        }

        .thumb-img.active {
            @apply border-2 border-amber-500 shadow-md;
        }
    </style>
</head>

<body class="bg-zinc-50 antialiased">

    <%- include("../partials/header.ejs") %>

        <main>
            <!-- BREADCRUMB SECTION (polished) -->
            <section class="bg-white border-b border-zinc-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
                    <nav class="flex items-center gap-2 text-sm text-zinc-500">
                        <a href="/" class="hover:text-amber-600 transition">Home</a>
                        <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400"></i>
                        <a href="/shop" class="hover:text-amber-600 transition">Shop</a>
                        <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400"></i>
                        <a href="/shop?category=<%= utensil.category_name %>"
                            class="hover:text-amber-600 transition capitalize">
                            <%= utensil.category_name %>
                        </a>
                        <i class="fa-solid fa-chevron-right text-[10px] text-zinc-400"></i>
                        <span class="text-zinc-800 font-medium">
                            <%= utensil.name %>
                        </span>
                    </nav>
                </div>
            </section>

            <!-- PRODUCT MAIN SECTION -->
            <section class="bg-white py-10">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="grid lg:grid-cols-2 gap-12">
                        <!-- LEFT COLUMN: IMAGE GALLERY -->
                        <div>
                            <div class="bg-zinc-100 rounded-2xl overflow-hidden shadow-md">
                                <img id="mainImage" src="<%= utensil.image_url %>" alt="<%= utensil.name %>"
                                    class="w-full h-[500px] object-cover transition-smooth">
                            </div>
                            <div class="grid grid-cols-4 gap-3 mt-4">
                                <% 
                                // Generate 4 thumbnail images (use same image or multiple if provided) const
                                    thumbnails=utensil.images ? utensil.images : [utensil.image_url, utensil.image_url,
                                    utensil.image_url, utensil.image_url]; for(let i=0; i < 4; i++) { %>
                                    <img src="<%= thumbnails[i] %>"
                                        class="thumb-img rounded-lg border border-zinc-200 cursor-pointer hover:opacity-80 transition-smooth w-full h-24 object-cover"
                                        data-img="<%= thumbnails[i] %>">
                                    <% } %>
                            </div>
                        </div>

                        <!-- RIGHT COLUMN: PRODUCT DETAILS -->
                        <div>
                            <span class="text-sm text-amber-600 font-semibold uppercase tracking-wide">
                                <%= utensil.category_name %>
                            </span>
                            <h1 class="text-4xl md:text-5xl font-bold text-zinc-900 mt-2">
                                <%= utensil.name %>
                            </h1>

                            <!-- RATING (dynamic stars) -->
                            <div class="flex items-center gap-3 mt-4">
                                <div class="flex text-amber-400 text-lg">
                                    <% const rating=utensil.rating || 4.8; %>
                                        <% for(let i=1; i <=5; i++) { %>
                                            <% if(i <=Math.floor(rating)) { %>
                                                <i class="fas fa-star"></i>
                                                <% } else if(i - rating < 1 && rating % 1 !==0) { %>
                                                    <i class="fas fa-star-half-alt"></i>
                                                    <% } else { %>
                                                        <i class="far fa-star"></i>
                                                        <% } %>
                                                            <% } %>
                                </div>
                                <span class="text-zinc-500 text-sm">
                                    <%= rating %> (<%= utensil.review_count || 245 %> reviews)
                                </span>
                            </div>

                            <!-- PRICE + OLD PRICE + BADGE -->
                            <div class="flex items-center gap-4 mt-6">
                                <span class="text-3xl md:text-4xl font-bold text-zinc-900">KES <%=
                                        Number(utensil.price).toLocaleString() %></span>
                                <% if(utensil.old_price) { %>
                                    <span class="text-xl text-zinc-400 line-through">KES <%=
                                            Number(utensil.old_price).toLocaleString() %></span>
                                    <% } %>
                                        <% if(utensil.badge) { %>
                                            <span
                                                class="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                                                <%= utensil.badge %>
                                            </span>
                                            <% } %>
                            </div>

                            <!-- SHORT DESCRIPTION -->
                            <p class="text-zinc-600 leading-relaxed mt-6">
                                <%= utensil.description %>
                            </p>

                            <!-- MATERIAL / SIZE SELECTION (UTENSIL SPECIFIC) -->
                            <div class="mt-8">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-zinc-800">Material:</span>
                                    <a href="#" class="text-sm text-amber-600 hover:underline">Size Guide</a>
                                </div>
                                <div class="flex flex-wrap gap-3 mt-2">
                                    <% const materials=utensil.materials || ['Stainless Steel', 'Silicone' , 'Wood' ];
                                        %>
                                        <% materials.forEach(mat=> { %>
                                            <button
                                                class="material-option px-5 py-2 border border-zinc-300 rounded-full text-sm hover:border-amber-500 transition-smooth">
                                                <%= mat %>
                                            </button>
                                            <% }) %>
                                </div>
                            </div>

                            <div class="mt-6">
                                <span class="font-semibold text-zinc-800">Blade Length / Size:</span>
                                <div class="flex flex-wrap gap-3 mt-2">
                                    <% const sizes=utensil.sizes || ['6 inch', '8 inch' , '10 inch' ]; %>
                                        <% sizes.forEach(sz=> { %>
                                            <button
                                                class="size-option px-5 py-2 border border-zinc-300 rounded-full text-sm hover:border-amber-500 transition-smooth">
                                                <%= sz %>
                                            </button>
                                            <% }) %>
                                </div>
                            </div>

                            <!-- STOCK STATUS -->
                            <div class="mt-8 flex items-center gap-6">
                                <div>
                                    <% if(utensil.stock> 0) { %>
                                        <span
                                            class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"><i
                                                class="fas fa-check-circle mr-1"></i> In Stock (<%= utensil.stock %>
                                                )</span>
                                        <% } else { %>
                                            <span
                                                class="px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium"><i
                                                    class="fas fa-times-circle mr-1"></i> Out of Stock</span>
                                            <% } %>
                                </div>
                                <div>
                                    <span class="font-semibold text-zinc-800">SKU:</span>
                                    <span class="text-zinc-600 ml-1">UT-<%= utensil.id %></span>
                                </div>
                            </div>

                            <!-- QUANTITY + BUTTONS -->
                            <div class="flex flex-wrap items-center gap-4 mt-8">
                                <div class="flex border border-zinc-300 rounded-lg overflow-hidden shadow-sm">
                                    <form action="/cart/decrease" method="POST">
                                        <input type="hidden" name="id" value="<%= utensil.id %>">
                                        <button type="submit"
                                            class="-12 h-12 text-xl hover:bg-zinc-100 transition-smooth">
                                            <i class="fa-solid fa-minus text-[10px]"></i>
                                        </button>
                                    </form>
                                    <input type="text" id="quantity" value="1"
                                        class="w-14 text-center outline-none text-zinc-800 font-medium">
                                    <form action="/cart/increase" method="POST">
                                        <input type="hidden" name="id" value="<%= utensil.id %>">
                                        <button type="submit"
                                            class="-12 h-12 text-xl hover:bg-zinc-100 transition-smooth p-4">
                                            <i class="fa-solid fa-plus text-[10px]"></i>
                                        </button>
                                    </form>
                                </div>
                                <button
                                    class="add-to-cart bg-amber-500 hover:bg-amber-600 text-white px-8 h-12 rounded-lg font-semibold shadow-md transition-smooth">
                                    <i class="fas fa-shopping-cart mr-2"></i> Add to Cart
                                </button>
                                <button
                                    class="buy-now border border-zinc-300 hover:border-amber-500 px-8 h-12 rounded-lg font-semibold transition-smooth">
                                    Buy Now
                                </button>
                            </div>

                            <!-- TAGS & SHARE -->
                            <div class="border-t border-zinc-100 mt-10 pt-6 space-y-4">
                                <div class="flex flex-wrap gap-2 items-center">
                                    <span class="font-semibold text-zinc-800">Tags:</span>
                                    <% const tags=utensil.tags || ['Utensil', 'Kitchen' , 'Chef' , 'Cooking' ]; %>
                                        <% tags.forEach(tag=> { %>
                                            <a href="#"
                                                class="bg-zinc-100 text-zinc-600 text-xs px-3 py-1 rounded-full hover:bg-amber-100 transition">#
                                                <%= tag %>
                                            </a>
                                            <% }) %>
                                </div>
                                <div class="flex items-center gap-4">
                                    <span class="font-semibold text-zinc-800">Share:</span>
                                    <div class="flex gap-3">
                                        <a href="#" class="text-zinc-500 hover:text-blue-600 transition"><i
                                                class="fab fa-facebook-f"></i></a>
                                        <a href="#" class="text-zinc-500 hover:text-sky-500 transition"><i
                                                class="fab fa-twitter"></i></a>
                                        <a href="#" class="text-zinc-500 hover:text-pink-600 transition"><i
                                                class="fab fa-instagram"></i></a>
                                        <a href="#" class="text-zinc-500 hover:text-green-600 transition"><i
                                                class="fab fa-whatsapp"></i></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <!-- TABS SECTION (DESCRIPTION / SPECIFICATIONS / REVIEWS) -->
            <section class="bg-white mt-4 border-t border-zinc-200">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <!-- Tab Buttons -->
                    <div class="flex flex-wrap gap-8 border-b border-zinc-200">
                        <button class="tab-btn pb-4 text-zinc-600 font-semibold transition-smooth"
                            data-tab="desc">Description</button>
                        <button class="tab-btn pb-4 text-zinc-600 font-semibold transition-smooth"
                            data-tab="specs">Specifications</button>
                        <button class="tab-btn pb-4 text-zinc-600 font-semibold transition-smooth"
                            data-tab="reviews">Reviews (<%= utensil.review_count || 107 %>)</button>
                    </div>

                    <!-- TAB CONTENT: Description -->
                    <div id="desc" class="tab-content pt-8">
                        <div class="flex items-center gap-4 mb-6">
                            <div class="text-2xl font-bold text-zinc-800">
                                <%= utensil.rating || 4.8 %> out of 5
                            </div>
                            <div class="flex text-amber-400">
                                <% for(let i=0; i<5; i++) { %><i class="fas fa-star"></i>
                                    <% } %>
                            </div>
                            <span class="text-zinc-500">(<%= utensil.review_count || 107 %> global ratings)</span>
                        </div>
                        <p class="text-zinc-600 leading-relaxed">
                            <%= utensil.long_description || utensil.description
                                + " This premium utensil is crafted from high-quality materials, ensuring durability and perfect ergonomics for daily kitchen tasks. Whether you're a professional chef or a home cook, this tool will elevate your cooking experience."
                                %>
                        </p>
                    </div>

                    <!-- TAB CONTENT: Specifications -->
                    <div id="specs" class="tab-content pt-8 hidden">
                        <table class="w-full text-left text-zinc-600 border-collapse">
                            <tr class="border-b border-zinc-100">
                                <th class="py-3 w-1/3 font-semibold text-zinc-800">Material</th>
                                <td class="py-3">
                                    <%= utensil.material || "High-carbon stainless steel" %>
                                </td>
                            </tr>
                            <tr class="border-b border-zinc-100">
                                <th class="py-3 font-semibold text-zinc-800">Blade Length</th>
                                <td class="py-3">
                                    <%= (utensil.sizes && utensil.sizes[0]) || "8 inch" %>
                                </td>
                            </tr>
                            <tr class="border-b border-zinc-100">
                                <th class="py-3 font-semibold text-zinc-800">Handle Material</th>
                                <td class="py-3">Ergonomic ABS / Natural Wood</td>
                            </tr>
                            <tr class="border-b border-zinc-100">
                                <th class="py-3 font-semibold text-zinc-800">Dishwasher Safe</th>
                                <td class="py-3">Yes (hand wash recommended)</td>
                            </tr>
                            <tr>
                                <th class="py-3 font-semibold text-zinc-800">Origin</th>
                                <td class="py-3">Imported</td>
                            </tr>
                        </table>
                    </div>

                    <!-- TAB CONTENT: Reviews -->
                    <div id="reviews" class="tab-content pt-8 hidden">
                        <!-- Rating summary bars (like reference image) -->
                        <div class="grid md:grid-cols-2 gap-8 mb-10">
                            <div>
                                <div class="flex items-center gap-2 mb-2"><span class="w-16 text-sm">5 Star</span>
                                    <div class="flex-1 bg-zinc-200 rounded-full h-2">
                                        <div class="bg-amber-400 h-2 rounded-full w-[70%]"></div>
                                    </div><span class="text-xs">70%</span>
                                </div>
                                <div class="flex items-center gap-2 mb-2"><span class="w-16 text-sm">4 Star</span>
                                    <div class="flex-1 bg-zinc-200 rounded-full h-2">
                                        <div class="bg-amber-400 h-2 rounded-full w-[20%]"></div>
                                    </div><span class="text-xs">20%</span>
                                </div>
                                <div class="flex items-center gap-2 mb-2"><span class="w-16 text-sm">3 Star</span>
                                    <div class="flex-1 bg-zinc-200 rounded-full h-2">
                                        <div class="bg-amber-400 h-2 rounded-full w-[5%]"></div>
                                    </div><span class="text-xs">5%</span>
                                </div>
                                <div class="flex items-center gap-2 mb-2"><span class="w-16 text-sm">2 Star</span>
                                    <div class="flex-1 bg-zinc-200 rounded-full h-2">
                                        <div class="bg-amber-400 h-2 rounded-full w-[3%]"></div>
                                    </div><span class="text-xs">3%</span>
                                </div>
                                <div class="flex items-center gap-2"><span class="w-16 text-sm">1 Star</span>
                                    <div class="flex-1 bg-zinc-200 rounded-full h-2">
                                        <div class="bg-amber-400 h-2 rounded-full w-[2%]"></div>
                                    </div><span class="text-xs">2%</span>
                                </div>
                            </div>
                            <div class="bg-zinc-50 p-6 rounded-xl text-center border">
                                <div class="text-4xl font-bold text-zinc-800">
                                    <%= utensil.rating || 4.8 %>
                                </div>
                                <div class="flex justify-center text-amber-400 my-2">
                                    <% for(let i=0; i<5; i++) { %><i class="fas fa-star"></i>
                                        <% } %>
                                </div>
                                <div class="text-zinc-500 text-sm">Based on <%= utensil.review_count || 245 %> reviews
                                </div>
                            </div>
                        </div>

                        <h3 class="font-bold text-xl mb-5">Customer Reviews</h3>
                        <div class="space-y-6">
                            <!-- Sample reviews (match image style) -->
                            <div class="border-b pb-5">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-zinc-800">Kristin Watson</span>
                                    <span class="text-xs text-zinc-400">Verified Purchase</span>
                                </div>
                                <div class="flex text-amber-400 text-sm my-1">
                                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i
                                        class="fas fa-star"></i><i class="fas fa-star"></i>
                                </div>
                                <p class="text-zinc-600 mt-1">Love it! This chef knife is incredibly sharp and
                                    well-balanced. Exactly what I was looking for.</p>
                                <span class="text-xs text-zinc-400">1 month ago</span>
                            </div>
                            <div class="border-b pb-5">
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-zinc-800">Bessie Cooper</span>
                                    <span class="text-xs text-zinc-400">Verified Purchase</span>
                                </div>
                                <div class="flex text-amber-400 text-sm my-1">
                                    <i class="fas fa-star"></i><i class="fas fa-star"></i><i class="fas fa-star"></i><i
                                        class="fas fa-star"></i><i class="fas fa-star"></i>
                                </div>
                                <p class="text-zinc-600 mt-1">Excellent product! The ergonomic handle makes it
                                    comfortable for long prep sessions. Highly recommend.</p>
                                <span class="text-xs text-zinc-400">2 months ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <script>
            // ========== TAB SWITCHING ==========
            const tabBtns = document.querySelectorAll('.tab-btn');
            const tabContents = document.querySelectorAll('.tab-content');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabId = btn.getAttribute('data-tab');
                    tabContents.forEach(content => content.classList.add('hidden'));
                    document.getElementById(tabId).classList.remove('hidden');
                    tabBtns.forEach(b => b.classList.remove('active', 'text-amber-600', 'border-amber-600'));
                    btn.classList.add('active', 'text-amber-600', 'border-amber-600');
                });
            });
            // Activate first tab by default
            if (tabBtns.length) tabBtns[0].click();

            // ========== THUMBNAIL GALLERY ==========
            const mainImg = document.getElementById('mainImage');
            const thumbs = document.querySelectorAll('.thumb-img');
            thumbs.forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const newSrc = thumb.getAttribute('data-img');
                    mainImg.src = newSrc;
                    thumbs.forEach(t => t.classList.remove('active'));
                    thumb.classList.add('active');
                });
            });
            // Activate first thumbnail
            if (thumbs.length) thumbs[0].classList.add('active');

            // ========== SIZE & MATERIAL SELECTION (UI ONLY) ==========
            document.querySelectorAll('.size-option, .material-option').forEach(opt => {
                opt.addEventListener('click', function () {
                    const parent = this.parentElement;
                    const siblings = parent.querySelectorAll('button');
                    siblings.forEach(sib => sib.classList.remove('active', 'bg-amber-600', 'text-white', 'border-amber-600'));
                    this.classList.add('active', 'bg-amber-600', 'text-white', 'border-amber-600');
                });
            });

            // ========== QUANTITY PICKER ==========
            const qtyInput = document.getElementById('quantity');
            const decrBtn = document.querySelector('.qty-decr');
            const incrBtn = document.querySelector('.qty-incr');
            if (decrBtn && incrBtn && qtyInput) {
                decrBtn.addEventListener('click', () => {
                    let val = parseInt(qtyInput.value);
                    if (val > 1) qtyInput.value = val - 1;
                });
                incrBtn.addEventListener('click', () => {
                    let val = parseInt(qtyInput.value);
                    if (val < ( <%= utensil.stock %> || 99)) qtyInput.value = val + 1;
            });
        }

            // ========== ADD TO CART SIMULATION (demo) ==========
            const addBtn = document.querySelector('.add-to-cart');
            if (addBtn) {
                addBtn.addEventListener('click', () => {
                    alert(`Added ${qtyInput.value} x ${document.querySelector('h1').innerText} to cart!`);
                });
            }
            const buyNow = document.querySelector('.buy-now');
            if (buyNow) {
                buyNow.addEventListener('click', () => {
                    window.location.href = '/checkout';
                });
            }
        </script>
</body>

</html>