using DreamUnlocker.Api.Models;

namespace DreamUnlocker.Api.Services;

public interface IJwtService
{
    string GenerateToken(User user);
    DateTime GetTokenExpiration();
}
