<% if (user) { %>

<form action="/products/<%= utensil.id %>/review" method="POST" class="space-y-4">

    <h3 class="text-lg font-bold">
        Leave a review
    </h3>

    <div>
        <label class="block text-sm font-medium">
            Rating
        </label>

        <select name="rating"
            class="border rounded p-2">

            <option value="5">★★★★★</option>
            <option value="4">★★★★</option>
            <option value="3">★★★</option>
            <option value="2">★★</option>
            <option value="1">★</option>

        </select>
    </div>


    <div>
        <textarea
            name="comment"
            placeholder="Write your review..."
            class="border rounded p-3 w-full"
            rows="4"></textarea>
    </div>


    <button type="submit"
        class="bg-black text-white px-5 py-2 rounded">
        Submit Review
    </button>

</form>

<% } else { %>

<p>
    Login to write a review
</p>

<% } %>
