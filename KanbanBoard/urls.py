"""KanbanBoard URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include #include for Django-REST-Framework
from rest_framework import routers #for routing with Django-REST-Framework
from Board.views import board_view, register_view, login_view, logout_view
from Board.views import UserViewSet, ListViewSet, TicketViewSet #viewset is in our Board-App

# To register a View under a URL
router = routers.DefaultRouter()
router.register(r'users', UserViewSet) #To make the UserViewSet accessible under the URL http://127.0.0.1:8000/users/
router.register(r'lists', ListViewSet) #To make the BoardViewSet accessible under the URL http://127.0.0.1:8000/lists/
router.register(r'tickets', TicketViewSet) #To make the TicketViewSet accessible under the URL http://127.0.0.1:8000/tickets/


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', board_view),
    #path('board/', board_view),
    path('register/', register_view),
    path('login/', login_view),
    path('logout/', logout_view),
    path('', include(router.urls)), #For access to all registered router-urls
]


