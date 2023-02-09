from django.contrib import admin
from .models import List, Ticket, TicketToUser

# Register your models here.

admin.site.register(List)
admin.site.register(Ticket)
admin.site.register(TicketToUser)
