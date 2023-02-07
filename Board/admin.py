from django.contrib import admin
from .models import Board, Ticket, BoardToUser, TicketToUser

# Register your models here.

admin.site.register(Board)
admin.site.register(Ticket)
admin.site.register(BoardToUser)
admin.site.register(TicketToUser)
