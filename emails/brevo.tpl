{% for user in params.users %}
     {{ user.username }}
{% else %}
     No user found
{% endfor %}

{% for item in params.items limit:2 %}
     {{ item.name }}
{% endfor %}

{% for placeholder in array reversed %}
{% endfor %}

{% for product in params.products %}
     {{ forloop.Counter }}. {{ product.name }}
{% endfor %}

{% for placeholder in array %}
     {{ forloop.Counter0 }}. variable // startin at 0
{% endfor %}

{% for placeholder in array %}
     {{ forloop.Revcounter }}. variable
{% endfor %}

{% for placeholder in array %}
     {{ forloop.Revcounter0 }}. variable
{% endfor %}

{% for product in params.products %}
     {% if product.price > 50 %}
          {{ product.name }} - ${{ product.price }}
     {% endif %}
{% endfor %}

{% for product in params.products %}
     {{ forloop.Counter }}.
     {% if forloop.First %}
          {{ product.name|upper }}
     {% else %}
          {{ product.name }}
     {% endif %}
{% endfor %}

{% for product in params.products %}
     {{ product.name }}{% if not forloop.Last %},{% endif %}
{% endfor %}


{% if params.tutors %}
The following tutors are available to help you:
{% for tutor in params.tutors %}
     {{ tutor.name }}
{% endfor %}
{% endif %}

{% if condition == "value" %}
     Add the content to display if the expression is true
{% endif %}

{% if "value" in condition %}
     Add the content to display if a value is present within a string or
     if a variable is found within an array
{% endif %}

% if temperature > 10 and temperature < 55 %}
     Brr. It’s cold! Here’s a coupon for 20% off of any hot beverage, today only.
{% endif %}

Hello
{% if contact.gender == "Male" %}
Mr. {{ contact.lastname }},
{% elif contact.gender == "Female" %}
Ms. {{ contact.lastname }},
{% else %}
there,
{% endif %}
