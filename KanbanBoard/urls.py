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
from django.urls import path
from Board.views import register_view, login_view, logout_view, board_view
from Board.views import UserAPI, TicketAPI, TicketAPIDetail
from django.conf.urls.static import static
from KanbanBoard import settings
from rest_framework.authtoken import views

# APIs
urlpatterns = [
    path('admin/', admin.site.urls),
    path('users/', UserAPI.as_view()),
    path('tickets/', TicketAPI.as_view()),
    path('tickets/<int:pk>/', TicketAPIDetail.as_view()),
    path('board/', board_view),
    path('register/', register_view),
    path('login/', login_view),
    path('logout/', logout_view),
    path('', board_view),
] + static(settings.STATIC_URL,document_root=settings.STATIC_ROOT)

urlpatterns += [
    path('get-token/', views.obtain_auth_token)
]

