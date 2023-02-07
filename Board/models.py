from django.db import models
from django.conf import settings
from datetime import date

# Create your models here.

# [1.] Model User already exists (username,first_name,last_name,email,password)

# [2.] Board (board_name,board_user,board_created_at,board_to_user)
class Board(models.Model):
    board_name = models.CharField(max_length=500)
    board_user = models.ForeignKey(to=settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_created_board',null=True) 
    board_created_at = models.DateField(default=date.today)  
    board_to_user = models.ManyToManyField(to=settings.AUTH_USER_MODEL, through='BoardToUser')

# [3.] Tickets (ticket_description,ticket_title,ticket_duedate,ticket_prio,ticket_category,ticket_created_at,ticket_to_user,ticket_board)
class Ticket(models.Model):
    ticket_description = models.CharField(max_length=500)
    ticket_title = models.CharField(max_length=500)
    ticket_duedate = models.DateField(default=date.today)      
    ticket_prio = models.CharField(max_length=500)
    ticket_category = models.CharField(max_length=500)
    ticket_created_at = models.DateField(default=date.today)  
    ticket_to_user = models.ManyToManyField(to=settings.AUTH_USER_MODEL, through='TicketToUser')
    ticket_board = models.ForeignKey(to=Board, on_delete=models.CASCADE, related_name='ticket_in_board',null=True) 
  
# [4.] Intermediate Model between Board and User
class BoardToUser(models.Model):
    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    b2u_created_at = models.DateField(default=date.today)

# [5.] Intermediate Model between Ticket and User
class TicketToUser(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    t2u_created_at = models.DateField(default=date.today)


